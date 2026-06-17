using backend.Data;
using backend.Domain;

namespace backend.Repositories
{
    public class SubmissionRepository : ISubmissionRepository
    {
        private readonly AppDbContext _dbContext;

        public SubmissionRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Submission> CreateAsync(Submission submission)
        {
            _dbContext.Submissions.Add(submission);
            await _dbContext.SaveChangesAsync();
            return submission;
        }

        public async Task SaveChangesAsync()
        {
            await _dbContext.SaveChangesAsync();
        }
    }
}
