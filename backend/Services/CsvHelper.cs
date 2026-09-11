using System.Text;

/// <summary>CSV minimal (RFC4180-ish) dengan deteksi delimiter otomatis (koma / titik koma —
/// Excel berbahasa Indonesia sering memakai titik koma sebagai pemisah daftar).</summary>
public static class CsvHelper
{
    public static List<Dictionary<string, string>> Parse(string content)
    {
        var lines = content.Replace("\r\n", "\n").Replace('\r', '\n').Split('\n')
            .Where(line => line.Length > 0).ToList();
        if (lines.Count == 0) return [];

        var delimiter = lines[0].Count(c => c == ';') > lines[0].Count(c => c == ',') ? ';' : ',';
        var headers = SplitLine(lines[0], delimiter).Select(h => h.Trim()).ToList();

        var rows = new List<Dictionary<string, string>>();
        for (var i = 1; i < lines.Count; i++)
        {
            if (string.IsNullOrWhiteSpace(lines[i])) continue;
            var values = SplitLine(lines[i], delimiter);
            var row = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            for (var j = 0; j < headers.Count; j++)
            {
                row[headers[j]] = j < values.Count ? values[j].Trim() : string.Empty;
            }
            rows.Add(row);
        }
        return rows;
    }

    private static List<string> SplitLine(string line, char delimiter)
    {
        var result = new List<string>();
        var current = new StringBuilder();
        var inQuotes = false;
        for (var i = 0; i < line.Length; i++)
        {
            var c = line[i];
            if (inQuotes)
            {
                if (c == '"')
                {
                    if (i + 1 < line.Length && line[i + 1] == '"') { current.Append('"'); i++; }
                    else inQuotes = false;
                }
                else current.Append(c);
            }
            else if (c == '"') inQuotes = true;
            else if (c == delimiter) { result.Add(current.ToString()); current.Clear(); }
            else current.Append(c);
        }
        result.Add(current.ToString());
        return result;
    }

    public static string Escape(string? value)
    {
        value ??= string.Empty;
        return value.Contains(',') || value.Contains(';') || value.Contains('"') || value.Contains('\n')
            ? $"\"{value.Replace("\"", "\"\"")}\""
            : value;
    }

    public static byte[] ToUtf8CsvBytes(string csv) =>
        [.. Encoding.UTF8.GetPreamble(), .. Encoding.UTF8.GetBytes(csv)];
}
