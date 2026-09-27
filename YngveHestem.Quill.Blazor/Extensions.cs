using System;
using System.Text;
using Microsoft.JSInterop;

namespace YngveHestem.Quill.Blazor;

public static class Extensions
{
    public static string ToCorrectJsString(this QuillSource source)
    {
        return source switch
        {
            QuillSource.User => "user",
            QuillSource.Api => "api",
            QuillSource.Silent => "silent",
            _ => "api",
        };
    }

    public static async Task<string> GetAsString(this IJSStreamReference streamRef, long maxAllowedStreamSize)
    {
        if (streamRef != null)
        {
            // 2. Åpne strømmen fra nettleseren (maks 10 MB her som sikkerhet)
            using var stream = await streamRef.OpenReadStreamAsync(maxAllowedSize: maxAllowedStreamSize);
            
            // 3. Les innholdet direkte inn i en StreamReader
            using var reader = new StreamReader(stream, System.Text.Encoding.UTF8);
            string text = await reader.ReadToEndAsync();
            return text;
        }
        return string.Empty;
    }

    public static DotNetStreamReference ToJsStream(this string content)
    {
        byte[] byteArray = Encoding.UTF8.GetBytes(content);

        // 1. Opprett en minnestrøm
        using var stream = new MemoryStream(byteArray);

        // 2. Lag en referanse som JS kan lese fra
        using var streamRef = new DotNetStreamReference(stream);

        return streamRef;
    }
}
