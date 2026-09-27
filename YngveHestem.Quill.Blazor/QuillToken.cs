namespace YngveHestem.Quill.Blazor;

public class QuillToken : IQuillToken
{
    public required string Id { get; set; }
    public required string ToolbarButtonHtmlContent { get; set; }

    public required Func<Task<QuillTokenEventResponse?>> OnToolbarButtonClicked { get; set; }

    public required Func<string, Task<QuillTokenEventResponse?>> OnTokenClicked { get; set; }
}