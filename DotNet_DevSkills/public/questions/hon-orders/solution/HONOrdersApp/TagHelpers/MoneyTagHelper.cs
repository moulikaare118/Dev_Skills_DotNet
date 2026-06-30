using DataAccess.ValueObject;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace HONOrdersApp.TagHelpers
{
    public class MoneyTagHelper : TagHelper
    {
        public decimal Value { get; set; }

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            // - Accept a decimal property named "Value".
            // - When rendered:
            //      • Replace the tag name with <span>
            //      • Format the decimal value using FormatMoney() extension method
            // - Set formatted result as tag content.
            // - Ensure no raw HTML injection occurs.

            output.TagName = "span";
            output.TagMode = TagMode.StartTagAndEndTag;
            
            var formattedValue = Value.FormatMoney();
            output.Content.SetContent(formattedValue);
        }
    }
}
