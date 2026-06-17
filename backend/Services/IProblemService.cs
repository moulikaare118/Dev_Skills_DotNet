using backend.Domain;

namespace backend.Services
{
    public interface IProblemService
    {
        Task<Problem?> GetProblemAsync(Guid problemId);
    }
}
