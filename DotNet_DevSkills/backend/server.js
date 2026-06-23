import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const backendDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(backendDir, '..');
const workspaceRoot = path.resolve(frontendRoot, '..');
const assessmentDataPath = path.join(backendDir, 'assessment-data.json');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 8787);
const defaultAssessmentKey = 'main-exam';
const fallbackCodeEditorAssessments = [
  {
    key: 'main-exam',
    label: 'Main Exam Code',
    starterRoot: 'MainExam_Todos',
    solutionRoot: 'MainExam',
    solutionFile: 'HON.Academy.sln'
  },
  {
    key: 'hon-orders',
    label: 'HON Orders Code',
    starterRoot: 'HON.Orders',
    solutionRoot: 'HON.Orders',
    solutionFile: 'HON.Orders.sln'
  }
];

const textExtensions = new Set(['.cs', '.csproj', '.sln', '.json', '.cshtml', '.css', '.js', '.jsx', '.md', '.config', '.txt', '.xml', '.yml', '.yaml']);
const skipFolders = new Set(['bin', 'obj', '.git', 'node_modules']);

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function normalizeAssessmentKey(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeCodeEditorConfig(data) {
  const sourceConfig = data?.codeEditor || {};
  const sourceAssessments = Array.isArray(sourceConfig.assessments) && sourceConfig.assessments.length > 0
    ? sourceConfig.assessments
    : fallbackCodeEditorAssessments;

  const assessments = sourceAssessments.map((assessment) => ({
    key: normalizeAssessmentKey(assessment.key),
    label: assessment.label || assessment.key,
    starterRoot: assessment.starterRoot || assessment.workspaceRoot || assessment.root || '',
    solutionRoot: assessment.solutionRoot || assessment.solutionWorkspaceRoot || assessment.starterRoot || assessment.workspaceRoot || assessment.root || '',
    solutionFile: assessment.solutionFile || assessment.solution || ''
  })).filter((assessment) => assessment.key);

  const defaultAssessment = normalizeAssessmentKey(sourceConfig.defaultAssessmentKey) || assessments[0]?.key || defaultAssessmentKey;

  return {
    title: sourceConfig.title || 'Assessment Type',
    defaultAssessmentKey: assessments.some((assessment) => assessment.key === defaultAssessment) ? defaultAssessment : assessments[0]?.key || defaultAssessmentKey,
    assessments
  };
}

function resolveAssessmentConfig(codeEditorConfig, assessmentKey) {
  const normalizedKey = normalizeAssessmentKey(assessmentKey) || codeEditorConfig.defaultAssessmentKey;
  return codeEditorConfig.assessments.find((assessment) => assessment.key === normalizedKey) || codeEditorConfig.assessments[0] || null;
}

function resolveAssessmentRoot(assessmentConfig, mode) {
  if (!assessmentConfig) {
    return null;
  }

  return mode === 'solution'
    ? assessmentConfig.solutionRoot || assessmentConfig.starterRoot
    : assessmentConfig.starterRoot || assessmentConfig.solutionRoot;
}

function resolveAssessmentSolutionFile(assessmentConfig) {
  return assessmentConfig?.solutionFile || '';
}

function appendSolutionOverlay(content, solutionBlock) {
  if (!solutionBlock) {
  return content;
  }

  return `${content}\n\n/*\nSOLUTION REFERENCE\n${solutionBlock.trim()}\n*/\n`;
}

const honOrdersSolutionBlocks = {
  'HON.Orders.Domain/ValueObjects/Money.cs': `namespace HON.Orders.Domain.ValueObjects
{
  public class Money : IEquatable<Money>
  {
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency = "USD")
    {
      if (amount < 0)
        throw new ArgumentException("Amount cannot be negative", nameof(amount));
      Amount = amount;
      Currency = currency;
    }

      public override string ToString() => $"{Currency} {Amount:F2}";
      public override string ToString() => $"${Currency} ${Amount:F2}";

    public static Money operator +(Money left, Money right)
    {
      if (left.Currency != right.Currency)
        throw new InvalidOperationException("Cannot add money with different currencies");
      return new Money(left.Amount + right.Amount, left.Currency);
    }

    public static Money operator -(Money left, Money right)
    {
      if (left.Currency != right.Currency)
        throw new InvalidOperationException("Cannot subtract money with different currencies");
      return new Money(left.Amount - right.Amount, left.Currency);
    }

    public static Money operator *(Money money, decimal multiplier)
      => new Money(money.Amount * multiplier, money.Currency);

    public bool Equals(Money other)
      => other != null && Amount == other.Amount && Currency == other.Currency;

    public override bool Equals(object obj)
      => Equals(obj as Money);

    public override int GetHashCode()
      => HashCode.Combine(Amount, Currency);
  }

  public static class DecimalExtensions
  {
    public static string FormatMoney(this decimal amount, string currency = "USD")
      => new Money(amount, currency).ToString();
  }
}`,
  'HON.Orders.Data/AppDbContext.cs': `namespace HON.Orders.Data
{
  public class AppDbContext : DbContext
  {
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options)
      : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);

      modelBuilder.Entity<Customer>()
        .HasIndex(c => c.Email)
        .IsUnique();

      modelBuilder.Entity<Product>()
        .Property(p => p.UnitPrice)
        .HasPrecision(18, 2);

      modelBuilder.Entity<Product>()
        .Property(p => p.RowVersion)
        .IsRowVersion();

      modelBuilder.Entity<Order>()
        .HasIndex(o => o.OrderNumber)
        .IsUnique();

      modelBuilder.Entity<Order>()
        .Property(o => o.Total)
        .HasPrecision(18, 2);

      modelBuilder.Entity<Order>()
        .Property(o => o.RowVersion)
        .IsRowVersion();

      modelBuilder.Entity<Order>()
        .HasOne(o => o.Customer)
        .WithMany(c => c.Orders)
        .HasForeignKey(o => o.CustomerId)
        .OnDelete(DeleteBehavior.Cascade);

      modelBuilder.Entity<OrderItem>()
        .HasOne(oi => oi.Order)
        .WithMany(o => o.OrderItems)
        .HasForeignKey(oi => oi.OrderId)
        .OnDelete(DeleteBehavior.Cascade);

      modelBuilder.Entity<OrderItem>()
        .HasOne(oi => oi.Product)
        .WithMany(p => p.OrderItems)
        .HasForeignKey(oi => oi.ProductId);

      modelBuilder.Entity<Payment>()
        .HasOne(p => p.Order)
        .WithMany(o => o.Payments)
        .HasForeignKey(p => p.OrderId)
        .OnDelete(DeleteBehavior.Cascade);

      modelBuilder.Entity<Customer>().HasQueryFilter(c => !c.IsDeleted);
      modelBuilder.Entity<Product>().HasQueryFilter(p => !p.IsDeleted);
      modelBuilder.Entity<Order>().HasQueryFilter(o => !o.IsDeleted);
      modelBuilder.Entity<OrderItem>().HasQueryFilter(oi => !oi.IsDeleted);
      modelBuilder.Entity<Payment>().HasQueryFilter(p => !p.IsDeleted);

      foreach (var entity in modelBuilder.Model.GetEntityTypes())
      {
        modelBuilder.Entity(entity.ClrType)
          .Property<DateTime>("CreatedAt")
          .HasDefaultValueSql("GETUTCDATE()");

        modelBuilder.Entity(entity.ClrType)
          .Property<DateTime>("LastModifiedAt")
          .HasDefaultValueSql("GETUTCDATE()");
      }
    }
  }

  public interface IHasSoftDelete
  {
    bool IsDeleted { get; set; }
  }
}`,
  'HON.Orders.Domain/Services/OrderService.cs': `namespace HON.Orders.Domain.Services
{
  public class OrderService
  {
    private readonly AppDbContext _context;

    public OrderService(AppDbContext context)
    {
      _context = context;
    }

    public IEnumerable<TopCustomerDto> GetTopCustomersByRevenue(int days = 30, int topCount = 5)
    {
      var since = DateTime.UtcNow.AddDays(-days);

      return _context.Orders
        .Where(o => o.OrderDate >= since)
        .Include(o => o.OrderItems)
        .GroupBy(o => o.Customer)
        .Select(g => new TopCustomerDto
        {
          CustomerName = g.Key.Name,
          OrdersCount = g.Count(),
          Revenue = g.SelectMany(o => o.OrderItems)
            .Sum(oi => oi.LineTotal)
        })
        .OrderByDescending(x => x.Revenue)
        .Take(topCount)
        .ToList();
    }

    public async IAsyncEnumerable<Order> StreamOrdersAsync(
      DateTime since,
      int pageSize = 20,
      [EnumeratorCancellation] CancellationToken ct = default)
    {
      int skip = 0;

      while (true)
      {
        var orders = await _context.Orders
          .Where(o => o.OrderDate >= since)
          .OrderByDescending(o => o.OrderDate)
          .Include(o => o.Customer)
          .Include(o => o.OrderItems)
          .Skip(skip)
          .Take(pageSize)
          .ToListAsync(ct);

        if (!orders.Any())
          break;

        foreach (var order in orders)
          yield return order;

        skip += pageSize;
      }
    }
  }

  public class TopCustomerDto
  {
    public string CustomerName { get; set; }
    public int OrdersCount { get; set; }
    public decimal Revenue { get; set; }
  }
}`,
  'HON.Orders.Domain/Filters/OrderFilterBuilder.cs': `namespace HON.Orders.Domain.Filters
{
  public class OrderFilterBuilder
  {
    public Expression<Func<Order, bool>> BuildFilter(
      string status = null,
      DateTime? fromDate = null,
      DateTime? toDate = null,
      decimal? minTotal = null,
      string customerEmail = null)
    {
      var parameter = Expression.Parameter(typeof(Order), "o");
      var expressions = new List<Expression>();

      if (!string.IsNullOrEmpty(status))
      {
        if (Enum.TryParse<OrderStatus>(status, out var orderStatus))
        {
          var statusProperty = Expression.Property(parameter, nameof(Order.Status));
          var statusConstant = Expression.Constant(orderStatus);
          expressions.Add(Expression.Equal(statusProperty, statusConstant));
        }
      }

      if (fromDate.HasValue)
      {
        var dateProperty = Expression.Property(parameter, nameof(Order.OrderDate));
        var dateConstant = Expression.Constant(fromDate.Value);
        expressions.Add(Expression.GreaterThanOrEqual(dateProperty, dateConstant));
      }

      if (toDate.HasValue)
      {
        var dateProperty = Expression.Property(parameter, nameof(Order.OrderDate));
        var dateConstant = Expression.Constant(toDate.Value);
        expressions.Add(Expression.LessThanOrEqual(dateProperty, dateConstant));
      }

      if (minTotal.HasValue)
      {
        var totalProperty = Expression.Property(parameter, nameof(Order.Total));
        var totalConstant = Expression.Constant(minTotal.Value);
        expressions.Add(Expression.GreaterThanOrEqual(totalProperty, totalConstant));
      }

      if (!string.IsNullOrEmpty(customerEmail))
      {
        var customerProperty = Expression.Property(parameter, nameof(Order.Customer));
        var emailProperty = Expression.Property(customerProperty, nameof(Customer.Email));
        var emailConstant = Expression.Constant(customerEmail);
        var containsMethod = typeof(string).GetMethod("Contains", new[] { typeof(string) });
        expressions.Add(Expression.Call(emailProperty, containsMethod, emailConstant));
      }

      if (expressions.Count == 0)
        return o => true;

      Expression combined = expressions[0];
      foreach (var expr in expressions.Skip(1))
        combined = Expression.AndAlso(combined, expr);

      return Expression.Lambda<Func<Order, bool>>(combined, parameter);
    }
  }
}`,
  'HON.Orders.Web/Filters/ExecutionTimeFilterAttribute.cs': `namespace HON.Orders.Web.Filters
{
  [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
  public class ExecutionTimeFilterAttribute : ActionFilterAttribute
  {
    private Stopwatch _stopwatch;

    public override void OnActionExecuting(ActionExecutingContext context)
    {
      _stopwatch = Stopwatch.StartNew();
      base.OnActionExecuting(context);
    }

    public override void OnActionExecuted(ActionExecutedContext context)
    {
      _stopwatch.Stop();
      var elapsedMs = _stopwatch.ElapsedMilliseconds;
      context.HttpContext.Response.Headers.Add("Server-Timing", $"total;dur={elapsedMs}");
      Console.WriteLine($"[{context.ActionDescriptor.DisplayName}] Executed in {elapsedMs}ms");
      base.OnActionExecuted(context);
    }
  }
}`,
  'HON.Orders.Web/Filters/AdminRoleCheckAttribute.cs': `namespace HON.Orders.Web.Filters
{
  [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
  public class AdminRoleCheckAttribute : Attribute, IAuthorizationFilter
  {
    public void OnAuthorization(AuthorizationFilterContext context)
    {
      var user = context.HttpContext.User;

      if (!user.Identity.IsAuthenticated || !user.HasClaim("role", "Admin"))
      {
        context.Result = new ForbidResult();
      }
    }
  }
}`,
  'HON.Orders.Web/TagHelpers/CurrencyFormatterTagHelper.cs': `namespace HON.Orders.Web.TagHelpers
{
  [HtmlTargetElement("currency")]
  public class CurrencyFormatterTagHelper : TagHelper
  {
    [HtmlAttributeName("value")]
    public decimal Value { get; set; }

    [HtmlAttributeName("currency")]
    public string Currency { get; set; } = "USD";

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
      var money = new Money(Value, Currency);
      output.TagName = null;
      output.Content.SetContent(money.ToString());
    }
  }
}`,
  'HON.Orders.Tests/MoneyTests.cs': `namespace HON.Orders.Tests
{
  public class MoneyTests
  {
    [Fact]
    public void Constructor_WithValidAmount_CreatesInstance()
    {
      var money = new Money(99.99m, "USD");
      Assert.Equal(99.99m, money.Amount);
      Assert.Equal("USD", money.Currency);
    }

    [Fact]
    public void Constructor_WithNegativeAmount_ThrowsArgumentException()
    {
      Assert.Throws<ArgumentException>(() => new Money(-10m, "USD"));
    }

    [Theory]
    [InlineData(10, 5, 15)]
    [InlineData(100, 25, 125)]
    public void Addition_TwoMoneyObjects_ReturnsSumWithCorrectCurrency(
      decimal amt1, decimal amt2, decimal expected)
    {
      var money1 = new Money(amt1, "USD");
      var money2 = new Money(amt2, "USD");
      var result = money1 + money2;
      Assert.Equal(expected, result.Amount);
      Assert.Equal("USD", result.Currency);
    }
  }
}`,
  'HON.Orders.Tests/OrderServiceTests.cs': `namespace HON.Orders.Tests
{
  public class OrderServiceTests : IDisposable
  {
    private readonly AppDbContext _context;
    private readonly OrderService _service;

    public OrderServiceTests()
    {
      var options = new DbContextOptionsBuilder<AppDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString())
        .Options;

      _context = new AppDbContext(options);
      _service = new OrderService(_context);

      SeedTestData();
    }

    [Fact]
    public void GetTopCustomersByRevenue_ReturnsTopFiveCustomers()
    {
      var result = _service.GetTopCustomersByRevenue(30, 5).ToList();
      Assert.Equal(2, result.Count);
      Assert.Equal("Alice", result[0].CustomerName);
      Assert.True(result[0].Revenue > 0);
    }

    [Fact]
    public async Task StreamOrdersAsync_YieldsResultsInPages()
    {
      var since = DateTime.UtcNow.AddDays(-60);
      var orders = new List<Order>();

      await foreach (var order in _service.StreamOrdersAsync(since, pageSize: 2))
      {
        orders.Add(order);
      }

      Assert.True(orders.Count > 0);
    }

    private void SeedTestData()
    {
      var customer = new Customer { Name = "Alice", Email = "alice@example.com" };
      var product = new Product { Name = "Widget", Sku = "WID001", UnitPrice = 99.99m };

      _context.Customers.Add(customer);
      _context.Products.Add(product);
      _context.SaveChanges();
    }

    public void Dispose()
    {
      _context.Dispose();
    }
  }
}`,
  'HON.Orders.Tests/DbContextTests.cs': `namespace HON.Orders.Tests
{
  public class DbContextTests
  {
  }
}`
};

function applyHonOrdersSolutionOverlay(files, mode, assessmentKey) {
  if (mode !== 'solution' || assessmentKey !== 'hon-orders') {
  return files;
  }

  return files.map((file) => {
  const solutionBlock = honOrdersSolutionBlocks[file.path];
  if (!solutionBlock) {
    return file;
  }

  return {
    ...file,
    content: appendSolutionOverlay(file.content, solutionBlock)
  };
  });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walkTextFiles(rootDir, currentDir = rootDir, results = []) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    if (skipFolders.has(entry.name)) {
      continue;
    }

    const entryPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      await walkTextFiles(rootDir, entryPath, results);
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (!textExtensions.has(extension)) {
      continue;
    }

    const content = await fs.readFile(entryPath, 'utf8');
    const relativePath = toPosix(path.relative(rootDir, entryPath));
    results.push({
      id: relativePath,
      name: entry.name,
      path: relativePath,
      readOnly: false,
      content
    });
  }

  return results;
}

function cloneFiles(files) {
  return files.map((file) => ({ ...file }));
}

function isRelevantScaffoldFile(file) {
  const filePath = (file?.path || '').toLowerCase();
  if (!filePath) {
    return false;
  }

  if (filePath.startsWith('hon.academy.web/wwwroot/') || filePath.includes('/wwwroot/lib/') || filePath.includes('/node_modules/')) {
    return false;
  }

  return filePath.endsWith('.cs') || filePath.endsWith('.cshtml') || filePath.endsWith('.razor');
}

function hasStarterScaffolding(files) {
  return files.some((file) => {
    if (!isRelevantScaffoldFile(file)) {
      return false;
    }

    const content = typeof file?.content === 'string' ? file.content : '';
    return content.includes('TODO') || content.includes('NotImplementedException') || content.includes('throw new NotImplementedException()');
  });
}

async function ensureProjectRoot(projectRoot, label) {
  if (!(await fileExists(projectRoot))) {
    throw new Error(`Could not find ${label} workspace at ${projectRoot}`);
  }
}

async function copyDirectory(source, target) {
  await fs.mkdir(target, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    if (skipFolders.has(entry.name)) {
      continue;
    }

    const sourceEntry = path.join(source, entry.name);
    const targetEntry = path.join(target, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourceEntry, targetEntry);
      continue;
    }

    await fs.copyFile(sourceEntry, targetEntry);
  }
}

async function writeSnapshotFiles(tempProjectRoot, files) {
  for (const file of files || []) {
    if (!file?.path || typeof file.content !== 'string') {
      continue;
    }

    const targetPath = path.join(tempProjectRoot, file.path);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, file.content, 'utf8');
  }
}

async function unzipArchive(zipPath, destinationDir) {
  await new Promise((resolve, reject) => {
    const unzip = spawn('unzip', ['-q', zipPath, '-d', destinationDir], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';

    unzip.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    unzip.on('error', reject);
    unzip.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr || `unzip exited with code ${code}`));
    });
  });
}

async function findSolutionRoot(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isFile() && entry.name.endsWith('.sln')) {
      return rootDir;
    }
    if (entry.isDirectory()) {
      const nested = await findSolutionRoot(entryPath).catch(() => null);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

async function findSolutionFile(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.sln')) {
      return entry.name;
    }
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const nested = await findSolutionFile(path.join(rootDir, entry.name)).catch(() => null);
    if (nested) {
      return nested;
    }
  }

  return null;
}

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, shell: false });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

async function runDotnetCommand(cwd, mode) {
  const command = mode === 'test'
    ? ['test', 'HON.Academy.sln', '-v', 'normal', '--logger', 'console;verbosity=normal']
    : ['build', 'HON.Academy.sln'];
  const result = await runCommand('dotnet', command, cwd);
  return { command, result };
}

function formatDotnetResult({ command, result }, mode) {
  const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();

  return output || [
    `dotnet ${command.join(' ')}`,
    result.code === 0 ? `${mode === 'test' ? 'Test run completed successfully.' : 'Build completed successfully.'}` : `${mode === 'test' ? 'Test run failed.' : 'Build failed.'}`,
    'No console output was produced by dotnet.'
  ].join('\n');
}

async function createProjectWorkspace(files = [], templateRoot) {
  await ensureProjectRoot(templateRoot, 'project');
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'devskills-dotnet-'));
  const projectRoot = path.join(tempRoot, 'MainExam');
  await copyDirectory(templateRoot, projectRoot);
  await writeSnapshotFiles(projectRoot, files);
  return { tempRoot, projectRoot };
}

async function getAssessmentExecutionConfig(assessmentKey) {
  const data = await loadAssessmentData();
  const codeEditorConfig = normalizeCodeEditorConfig(data);
  const assessmentConfig = resolveAssessmentConfig(codeEditorConfig, assessmentKey);

  if (!assessmentConfig) {
    throw new Error('No code is configured for the selected assessment.');
  }

  const starterRootName = assessmentConfig.starterRoot || assessmentConfig.solutionRoot;
  const solutionRootName = assessmentConfig.solutionRoot || assessmentConfig.starterRoot;
  const solutionFile = resolveAssessmentSolutionFile(assessmentConfig)
    || assessmentConfig.solutionFile
    || await findSolutionFile(path.join(workspaceRoot, starterRootName)).catch(() => null)
    || await findSolutionFile(path.join(workspaceRoot, solutionRootName)).catch(() => null)
    || '';

  if (!starterRootName || !solutionRootName || !solutionFile) {
    throw new Error(`Assessment configuration is incomplete for ${assessmentConfig.label || assessmentConfig.key}.`);
  }

  return {
    assessmentConfig,
    starterRoot: path.join(workspaceRoot, starterRootName),
    solutionRoot: path.join(workspaceRoot, solutionRootName),
    solutionFile
  };
}

async function evaluateProjectBuildAndTest(files, assessmentKey) {
  const { starterRoot, solutionFile } = await getAssessmentExecutionConfig(assessmentKey);
  const { tempRoot, projectRoot } = await createProjectWorkspace(files, starterRoot);
  try {
    const buildResult = await runCommand('dotnet', ['build', solutionFile], projectRoot);
    const buildOutput = formatDotnetResult(buildResult, 'build');

    if (buildResult.result.code !== 0) {
      return {
        success: false,
        exitCode: buildResult.result.code,
        output: buildOutput,
        buildResult: {
          success: false,
          exitCode: buildResult.result.code,
          output: buildOutput
        },
        testResult: null,
        workspaceRoot: projectRoot
      };
    }

    const testResult = await runCommand('dotnet', ['test', solutionFile, '-v', 'normal', '--logger', 'console;verbosity=normal'], projectRoot);
    const testOutput = formatDotnetResult(testResult, 'test');

    return {
      success: testResult.result.code === 0,
      exitCode: testResult.result.code,
      output: [buildOutput, testOutput].filter(Boolean).join('\n\n'),
      buildResult: {
        success: true,
        exitCode: buildResult.result.code,
        output: buildOutput
      },
      testResult: {
        success: testResult.result.code === 0,
        exitCode: testResult.result.code,
        output: testOutput
      },
      workspaceRoot: projectRoot
    };
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

function jsonResponse(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }

  return body ? JSON.parse(body) : {};
}

async function loadAssessmentData() {
  const raw = await fs.readFile(assessmentDataPath, 'utf8');
  return JSON.parse(raw);
}

async function loadWorkspaceFiles(assessmentKey, mode = 'starter') {
  const data = await loadAssessmentData();
  const codeEditorConfig = normalizeCodeEditorConfig(data);
  const assessmentConfig = resolveAssessmentConfig(codeEditorConfig, assessmentKey);
  const rootName = resolveAssessmentRoot(assessmentConfig, mode);

  if (!assessmentConfig || !rootName) {
    throw new Error('No code is configured for the selected assessment.');
  }

  const projectRoot = path.join(workspaceRoot, rootName);
  await ensureProjectRoot(projectRoot, assessmentConfig.label || 'selected assessment');

  const files = await walkTextFiles(projectRoot);
  if (!files.length) {
    throw new Error(`No code files were found for ${assessmentConfig.label || 'the selected assessment'}.`);
  }

  return cloneFiles(applyHonOrdersSolutionOverlay(files, mode, assessmentConfig.key));
}

async function loadSolutionFiles(assessmentKey) {
  return loadWorkspaceFiles(assessmentKey, 'solution');
}

function parseTestOutput(output) {
  const lines = output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const summary = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: null
  };
  const testCases = [];
  let currentFailedTest = null;

  for (const line of lines) {
    const resultMatch = line.match(/^(Passed|Failed|Skipped)\s+(.+?)\s+\[(.+?)\]$/);
    if (resultMatch) {
      const [, status, fullName, duration] = resultMatch;
      const testCase = {
        name: fullName.trim(),
        status: status.toLowerCase(),
        duration: duration.trim(),
        failureMessage: ''
      };
      testCases.push(testCase);
      if (status === 'Passed') summary.passed += 1;
      if (status === 'Failed') {
        summary.failed += 1;
        currentFailedTest = testCase;
      }
      if (status === 'Skipped') summary.skipped += 1;
      continue;
    }

    const totalMatch = line.match(/^(Total tests|Total):\s*(\d+)/i);
    if (totalMatch && !summary.total) {
      summary.total = Number(totalMatch[2]);
      continue;
    }

    const passedMatch = line.match(/^Passed:\s*(\d+)/i);
    if (passedMatch) {
      summary.passed = Number(passedMatch[1]);
      continue;
    }

    const failedMatch = line.match(/^(Failed|Failures?):\s*(\d+)/i);
    if (failedMatch) {
      summary.failed = Number(failedMatch[2]);
      continue;
    }

    const skippedMatch = line.match(/^Skipped:\s*(\d+)/i);
    if (skippedMatch) {
      summary.skipped = Number(skippedMatch[1]);
      continue;
    }

    const durationMatch = line.match(/^(Total time|duration):\s*(.+)$/i);
    if (durationMatch) {
      summary.duration = durationMatch[2].trim();
      continue;
    }

    if (currentFailedTest && !line.startsWith('xUnit.net') && !line.startsWith('A total of') && !line.startsWith('Test Run') && !/^(Total tests|Passed|Failed|Skipped|Total time|duration):/i.test(line)) {
      currentFailedTest.failureMessage += `${line}\n`;
    }
  }

  if (!summary.total && summary.passed + summary.failed + summary.skipped) {
    summary.total = summary.passed + summary.failed + summary.skipped;
  }

  return { summary, testCases };
}

async function evaluateProject(files, mode, assessmentKey) {
  const { starterRoot, solutionFile } = await getAssessmentExecutionConfig(assessmentKey);
  const { tempRoot, projectRoot } = await createProjectWorkspace(files, starterRoot);
  try {
    const command = mode === 'test'
      ? ['test', solutionFile, '-v', 'normal', '--logger', 'console;verbosity=normal']
      : ['build', solutionFile];
    const result = await runCommand('dotnet', command, projectRoot);
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    const finalOutput = output || [
      `dotnet ${command.join(' ')}`,
      result.code === 0 ? `${mode === 'test' ? 'Test run completed successfully.' : 'Build completed successfully.'}` : `${mode === 'test' ? 'Test run failed.' : 'Build failed.'}`,
      'No console output was produced by dotnet.'
    ].join('\n');
    const response = {
      success: result.code === 0,
      exitCode: result.code,
      output: finalOutput,
      workspaceRoot: projectRoot
    };

    if (mode === 'test') {
      const { summary, testCases } = parseTestOutput(finalOutput);
      response.testSummary = summary;
      response.testCases = testCases;
    }

    return response;
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

async function evaluateZip(zipBase64, mode) {
  if (!zipBase64) {
    throw new Error('Missing zip payload.');
  }

  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'devskills-zip-'));
  const zipPath = path.join(tempRoot, 'submission.zip');
  const extractRoot = path.join(tempRoot, 'extract');
  await fs.mkdir(extractRoot, { recursive: true });
  await fs.writeFile(zipPath, Buffer.from(zipBase64, 'base64'));
  await unzipArchive(zipPath, extractRoot);

  const solutionRoot = (await findSolutionRoot(extractRoot)) || extractRoot;
  try {
    let command;
    if (mode === 'test') {
      // Run tests on the specific test project
      command = ['test', 'HON.Academy.XunitTests/HON.Academy.XunitTests.csproj', '--verbosity', 'normal'];
    } else {
      command = ['build'];
    }
    const result = await runCommand('dotnet', command, solutionRoot);
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    const finalOutput = output || [
      `dotnet ${command.join(' ')}`,
      result.code === 0 ? `${mode === 'test' ? 'Test run completed successfully.' : 'Build completed successfully.'}` : `${mode === 'test' ? 'Test run failed.' : 'Build failed.'}`,
      'No console output was produced by dotnet.'
    ].join('\n');

    const response = {
      success: result.code === 0,
      exitCode: result.code,
      output: finalOutput,
      workspaceRoot: solutionRoot
    };

    if (mode === 'test') {
      const { summary, testCases } = parseTestOutput(finalOutput);
      response.testSummary = summary;
      response.testCases = testCases;
    }

    return response;
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end();
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/workspace') {
      const assessmentKey = url.searchParams.get('assessment') || url.searchParams.get('assessmentKey');
      const mode = url.searchParams.get('mode') === 'solution' ? 'solution' : 'starter';
      const files = await loadWorkspaceFiles(assessmentKey, mode);
      jsonResponse(res, 200, { files });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/workspace/solution') {
      const assessmentKey = url.searchParams.get('assessment') || url.searchParams.get('assessmentKey');
      const files = await loadSolutionFiles(assessmentKey);
      jsonResponse(res, 200, { files });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/assessment/meta') {
      const data = await loadAssessmentData();
      jsonResponse(res, 200, data);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/project/run') {
      const body = await readJsonBody(req);
      const result = await evaluateProject(body.files || [], 'build', body.assessmentKey);
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/project/tests') {
      const body = await readJsonBody(req);
      const result = await evaluateProject(body.files || [], 'test', body.assessmentKey);
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/project/build-and-test') {
      const body = await readJsonBody(req);
      const result = await evaluateProjectBuildAndTest(body.files || [], body.assessmentKey);
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/project/submit') {
      const body = await readJsonBody(req);
      const result = await evaluateProject(body.files || [], 'test', body.assessmentKey);
      jsonResponse(res, 200, {
        ...result,
        status: result.success ? 'Submitted' : 'Blocked'
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/assessment/build') {
      const body = await readJsonBody(req);
      const result = await evaluateZip(body.zipBase64, 'build');
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/assessment/tests') {
      const body = await readJsonBody(req);
      const result = await evaluateZip(body.zipBase64, 'test');
      jsonResponse(res, 200, result);
      return;
    }

    jsonResponse(res, 404, { error: 'Not found' });
  } catch (error) {
    jsonResponse(res, 500, { error: error?.message || 'Unexpected server error' });
  }
});

server.listen(port, host, () => {
  process.stdout.write(`DevSkills backend listening on http://${host}:${port}\n`);
});
