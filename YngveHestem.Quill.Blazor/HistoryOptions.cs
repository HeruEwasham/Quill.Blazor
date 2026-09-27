namespace YngveHestem.Quill.Blazor;

public class HistoryOptions
{
    /// <summary>
    /// Changes occuring within the delay number of milliseconds are merged into a single change.
    /// </summary>
    public int Delay { get; set; } = 1000;

    /// <summary>
    /// Maximum size of the history's undo/redo stack. Merged changes with the delay option counts as a singular change.
    /// </summary>
    public int MaxStack { get; set; } = 100;

    /// <summary>
    /// By default all changes, whether originating from user input or programmatically through the API, are treated the same and change be undone or redone by the history module. If userOnly is set to true, only user changes will be undone or redone.
    /// </summary>
    public bool UserOnly { get; set; } = false;
}
