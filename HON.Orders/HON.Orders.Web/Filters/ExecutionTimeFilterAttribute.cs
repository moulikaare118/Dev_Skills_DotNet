namespace HON.Orders.Web.Filters
{
  [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
  // TODO: Log action execution time and add Server-Timing header for diagnostics.
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
}