using backend.Domain;

namespace backend.Repositories
{
    public interface IExecutionLogRepository
    {
        Task AddAsync(ExecutionLog executionLog);
        Task SaveChangesAsync();
    }
}
