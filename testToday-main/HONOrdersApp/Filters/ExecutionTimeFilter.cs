using Microsoft.AspNetCore.Mvc.Filters;
using System.Diagnostics;

namespace HONOrdersApp.Filters
{
    public class ExecutionTimeFilter : IActionFilter
    {
        private Stopwatch? _watch;

        public void OnActionExecuting(ActionExecutingContext context)
        {
            _watch = Stopwatch.StartNew();
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            if (_watch is null)
            {
                return;
            }

            _watch.Stop();
            var duration = _watch.Elapsed.TotalMilliseconds;
            context.HttpContext.Response.Headers["Server-Timing"] = $"app;dur={duration}";
        }
    }
}
