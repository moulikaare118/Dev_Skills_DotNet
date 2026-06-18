using Microsoft.AspNetCore.Mvc.Filters;

namespace HON.Orders.Web.Filters;

// task3.2 - Log execution time and add Server-Timing header
public class ExecutionTimingFilter : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        context.HttpContext.Items["ActionStart"] = DateTime.UtcNow;
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        if (context.HttpContext.Items.TryGetValue("ActionStart", out var startObj)
            && startObj is DateTime start)
        {
            var duration = DateTime.UtcNow - start;
            context.HttpContext.Response.Headers["Server-Timing"] = $"app;dur={duration.TotalMilliseconds:F0}";
        }
    }
}
