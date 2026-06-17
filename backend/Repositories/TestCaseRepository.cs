using backend.Data;
using backend.Domain;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class TestCaseRepository : ITestCaseRepository
    {
        private readonly AppDbContext _dbContext;

        public TestCaseRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public Task<List<TestCase>> GetVisibleByProblemIdAsync(Guid problemId)
        {
            return _dbContext.TestCases
                .Where(tc => tc.ProblemId == problemId && !tc.IsHidden)
                .ToListAsync();
        }

        public Task<List<TestCase>> GetHiddenByProblemIdAsync(Guid problemId)
        {
            return _dbContext.TestCases
                .Where(tc => tc.ProblemId == problemId && tc.IsHidden)
                .ToListAsync();
        }
    }
}
