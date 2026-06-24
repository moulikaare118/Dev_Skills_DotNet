namespace HON.Orders.Web.Filters
{
  [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
  // TODO: Authorize admin area access by checking role claims without using Web APIs.
  public class AdminRoleCheckAttribute : Attribute, IAuthorizationFilter
  {
    public void OnAuthorization(AuthorizationFilterContext context)
    {
      var user = context.HttpContext.User;

      if (!user.Identity.IsAuthenticated || !user.HasClaim("role", "Admin"))
      {
        context.Result = new ForbidResult();
      }
    }
  }
}