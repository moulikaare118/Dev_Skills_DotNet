namespace HON.Orders.Web.TagHelpers
{
  // TODO: Build a custom currency tag helper that formats values and binds cleanly to model data.
  [HtmlTargetElement("currency")]
  public class CurrencyFormatterTagHelper : TagHelper
  {
    [HtmlAttributeName("value")]
    public decimal Value { get; set; }

    [HtmlAttributeName("currency")]
    public string Currency { get; set; } = "USD";

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
      var money = new Money(Value, Currency);
      output.TagName = null;
      output.Content.SetContent(money.ToString());
    }
  }
}