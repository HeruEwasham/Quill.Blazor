using System.Text.Json;
using System.Text.Json.Serialization;

namespace YngveHestem.Quill.Blazor;

public class QuillOp
{
    // Kan være string (for tekst) eller et komplekst objekt (f.eks. { image: "url" })
    [JsonPropertyName("insert")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public object? Insert { get; set; }

    [JsonPropertyName("delete")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? Delete { get; set; }

    [JsonPropertyName("retain")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? Retain { get; set; }

    [JsonPropertyName("attributes")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public Dictionary<string, object>? Attributes { get; set; }

    // Hjelpemetoder for å sjekke typen insert enkelt
    [JsonIgnore]
    public bool IsTextInsert => Insert is JsonElement elem ? elem.ValueKind == JsonValueKind.String : Insert is string;

    [JsonIgnore]
    public string? TextInsert => Insert is JsonElement elem && elem.ValueKind == JsonValueKind.String ? elem.GetString() : Insert as string;
}
