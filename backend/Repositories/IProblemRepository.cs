using backend.Domain;

namespace backend.Repositories
{
    public interface IProblemRepository
    {
        Task<Problem?> GetByIdAsync(Guid id);
    }
}
