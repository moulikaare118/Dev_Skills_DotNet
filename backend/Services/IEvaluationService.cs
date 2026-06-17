using backend.DTOs;

namespace backend.Services
{
    public interface IEvaluationService
    {
        Task<CodeRunResponse> RunCustomCodeAsync(Guid problemId, string code, string input);
        Task<CodeTestResponse> RunVisibleTestsAsync(Guid problemId, string code);
        Task<CodeSubmitResponse> SubmitSolutionAsync(Guid problemId, Guid userId, string code);
    }
}
