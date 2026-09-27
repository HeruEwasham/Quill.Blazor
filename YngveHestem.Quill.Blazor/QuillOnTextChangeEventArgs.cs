namespace YngveHestem.Quill.Blazor;

public class QuillOnTextChangeEventArgs(QuillDelta delta, QuillDelta oldDelta, QuillSource source)
{
    public QuillDelta Delta { get; } = delta;
    public QuillDelta OldDelta { get; } = oldDelta;
    public QuillSource Source { get; } = source;
}
