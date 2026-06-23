namespace HON.Orders.Web.Filters
{
    /// <summary>
    /// Authorization filter to check for Admin role
    /// TODO: Check User.HasClaim("role", "Admin")
    /// TODO: Return 403 Forbidden if not authorized
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AdminRoleCheckAttribute : Attribute, IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            // TODO: Check if user is authenticated
            // TODO: Check if user has "Admin" role claim
            // TODO: If not authorized, set context.Result = new ForbidResult()
        }
    }
}
