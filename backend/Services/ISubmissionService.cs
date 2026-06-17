using backend.Domain;

namespace backend.Services
{
    public interface ISubmissionService
    {
        Task<Submission> RecordSubmissionAsync(Submission submission);
    }
}
