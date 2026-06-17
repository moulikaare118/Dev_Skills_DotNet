using backend.Domain;

namespace backend.Repositories
{
    public interface ISubmissionRepository
    {
        Task<Submission> CreateAsync(Submission submission);
        Task SaveChangesAsync();
    }
}
