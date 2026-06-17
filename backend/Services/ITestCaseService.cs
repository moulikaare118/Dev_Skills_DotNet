using backend.Domain;

namespace backend.Services
{
    public interface ITestCaseService
    {
        Task<List<TestCase>> GetVisibleTestCasesAsync(Guid problemId);
        Task<List<TestCase>> GetHiddenTestCasesAsync(Guid problemId);
    }
}
