using backend.Data;
using backend.Domain;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class ProblemRepository : IProblemRepository
    {
        private readonly AppDbContext _dbContext;

        public ProblemRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public Task<Problem?> GetByIdAsync(Guid id)
        {
            return _dbContext.Problems
                .Include(p => p.TestCases)
                .FirstOrDefaultAsync(p => p.Id == id);
        }
    }
}
