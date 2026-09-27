using System;

namespace YngveHestem.Quill.Blazor;

public class QuillTokenEventResponse
{
    public required string Value { get; set; }
    public required HtmlElement VisibleToken { get; set; }
}
