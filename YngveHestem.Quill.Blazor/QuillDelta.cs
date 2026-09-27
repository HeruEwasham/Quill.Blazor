using System.Text.Json.Serialization;

namespace YngveHestem.Quill.Blazor;
public class QuillDelta
{
    [JsonPropertyName("ops")]
    public List<QuillOp> Ops { get; set; } = new();
}
