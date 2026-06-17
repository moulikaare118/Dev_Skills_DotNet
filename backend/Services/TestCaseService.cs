using backend.Domain;
using backend.Repositories;

namespace backend.Services
{
    public class TestCaseService : ITestCaseService
    {
        private readonly ITestCaseRepository _testCaseRepository;

        public TestCaseService(ITestCaseRepository testCaseRepository)
        {
            _testCaseRepository = testCaseRepository;
        }

        public Task<List<TestCase>> GetVisibleTestCasesAsync(Guid problemId)
        {
            return _testCaseRepository.GetVisibleByProblemIdAsync(problemId);
        }

        public Task<List<TestCase>> GetHiddenTestCasesAsync(Guid problemId)
        {
            return _testCaseRepository.GetHiddenByProblemIdAsync(problemId);
        }
    }
}
