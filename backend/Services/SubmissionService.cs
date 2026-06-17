using backend.Domain;
using backend.Repositories;

namespace backend.Services
{
    public class SubmissionService : ISubmissionService
    {
        private readonly ISubmissionRepository _submissionRepository;

        public SubmissionService(ISubmissionRepository submissionRepository)
        {
            _submissionRepository = submissionRepository;
        }

        public Task<Submission> RecordSubmissionAsync(Submission submission)
        {
            return _submissionRepository.CreateAsync(submission);
        }
    }
}
