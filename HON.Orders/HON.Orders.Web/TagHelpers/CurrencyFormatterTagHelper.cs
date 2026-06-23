using Microsoft.AspNetCore.Razor.TagHelpers;

namespace HON.Orders.Web.TagHelpers
{
    /// <summary>
    /// Tag helper to format decimal as currency
    /// TODO: Use Money value object to format currency
    /// Usage: <currency value="99.99" currency="USD"></currency>
    /// Output: USD 99.99
    /// </summary>
    [HtmlTargetElement("currency")]
    public class CurrencyFormatterTagHelper : TagHelper
    {
        [HtmlAttributeName("value")]
        public decimal Value { get; set; }

        [HtmlAttributeName("currency")]
        public string Currency { get; set; } = "USD";

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            // TODO: Format value using Money value object
            // TODO: Set output content to formatted string
            output.TagName = null;
            output.Content.SetContent($"{Currency} {Value:F2}");
        }
    }
}
