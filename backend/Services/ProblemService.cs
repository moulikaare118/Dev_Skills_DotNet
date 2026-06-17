using backend.Domain;
using backend.Repositories;

namespace backend.Services
{
    public class ProblemService : IProblemService
    {
        private readonly IProblemRepository _problemRepository;

        public ProblemService(IProblemRepository problemRepository)
        {
            _problemRepository = problemRepository;
        }

        public Task<Problem?> GetProblemAsync(Guid problemId)
        {
            return _problemRepository.GetByIdAsync(problemId);
        }
    }
}
