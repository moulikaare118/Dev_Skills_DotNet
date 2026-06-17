using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/code")]
    public class CodeController : ControllerBase
    {
        private readonly IEvaluationService _evaluationService;

        public CodeController(IEvaluationService evaluationService)
        {
            _evaluationService = evaluationService;
        }

        [HttpPost("run")]
        public async Task<IActionResult> RunCode([FromBody] CodeRunRequest request)
        {
            var response = await _evaluationService.RunCustomCodeAsync(request.ProblemId, request.Code, request.CustomInput);
            return Ok(response);
        }

        [HttpPost("test")]
        public async Task<IActionResult> RunSampleTests([FromBody] CodeTestRequest request)
        {
            var response = await _evaluationService.RunVisibleTestsAsync(request.ProblemId, request.Code);
            return Ok(response);
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitSolution([FromBody] CodeSubmitRequest request)
        {
            var response = await _evaluationService.SubmitSolutionAsync(request.ProblemId, request.UserId, request.Code);
            return Ok(response);
        }
    }
}
