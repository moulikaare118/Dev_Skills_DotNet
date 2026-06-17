namespace backend.Execution
{
    public interface ICodeExecutionService
    {
        Task<ExecutionResult> RunAsync(string code, string input);
    }
}
