namespace YngveHestem.Quill.Blazor;

public class HtmlElement
{
    // Raw HTML or text content to put inside the element
    public string InnerHtml { get; set; } = string.Empty;

    // Inline styles (e.g., { "color": "red", "font-size": "16px" })
    public Dictionary<string, string> Styles { get; set; } = new();

    // Attributes (e.g., { "id": "my-id", "class": "btn btn-primary", "disabled": "true" })
    public Dictionary<string, object> Attributes { get; set; } = new();
}
