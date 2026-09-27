namespace YngveHestem.Quill.Blazor;

public class QuillOnSelectionChangeEventArgs(QuillRange range, QuillRange oldRange, QuillSource source)
{
    public QuillRange Range { get; } = range;
    public QuillRange OldRange { get; } = oldRange;
    public QuillSource Source { get; } = source;
}
