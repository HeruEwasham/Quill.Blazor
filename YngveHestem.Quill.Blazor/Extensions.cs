using System;

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
}
