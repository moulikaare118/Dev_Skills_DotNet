using backend.Data;
using backend.Domain;

namespace backend.Repositories
{
    public class ExecutionLogRepository : IExecutionLogRepository
    {
        private readonly AppDbContext _dbContext;

        public ExecutionLogRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task AddAsync(ExecutionLog executionLog)
        {
            _dbContext.ExecutionLogs.Add(executionLog);
            await _dbContext.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _dbContext.SaveChangesAsync();
        }
    }
}
