using System;

namespace YngveHestem.Quill.Blazor;

using System.Text.Json;
using System.Text.Json.Serialization;

public class QuillDelta
{
    [JsonPropertyName("ops")]
    public List<QuillOp> Ops { get; set; } = new();
}
