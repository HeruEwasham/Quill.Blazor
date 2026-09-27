using System.Text.Json.Serialization;

namespace YngveHestem.Quill.Blazor;

public interface IQuillToken
{
    public string Id { get; }
    public string ToolbarButtonHtmlContent { get; }

    [JsonIgnore]
    public Func<Task<QuillTokenEventResponse?>> OnToolbarButtonClicked { get; }

    [JsonIgnore]
    public Func<string, Task<QuillTokenEventResponse?>> OnTokenClicked { get; }
}
