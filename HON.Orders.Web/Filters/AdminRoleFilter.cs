using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace HON.Orders.Web.Filters;

// task3.2 - Authorization filter for Admin area role checks
public class AdminRoleFilter : IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;
        if (!user.Identity?.IsAuthenticated ?? true)
        {
            context.Result = new ForbidResult();
            return;
        }

        if (!user.IsInRole("Admin"))
        {
            context.Result = new ForbidResult();
        }
    }
}
