using backend.Domain;

namespace backend.Repositories
{
    public interface ITestCaseRepository
    {
        Task<List<TestCase>> GetVisibleByProblemIdAsync(Guid problemId);
        Task<List<TestCase>> GetHiddenByProblemIdAsync(Guid problemId);
    }
}
