using System.Diagnostics;

namespace HON.Orders.Web.Filters
{
    /// <summary>
    /// Action filter that logs execution time and adds Server-Timing header
    /// TODO: Implement timer, calculate elapsed time, add response header
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class ExecutionTimeFilterAttribute : ActionFilterAttribute
    {
        private Stopwatch _stopwatch = null!;

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            // TODO: Start stopwatch
            base.OnActionExecuting(context);
        }

        public override void OnActionExecuted(ActionExecutedContext context)
        {
            // TODO: Stop stopwatch
            // TODO: Calculate elapsed milliseconds
            // TODO: Add "Server-Timing" response header
            // TODO: Log to console
            base.OnActionExecuted(context);
        }
    }
}
