namespace backend.Utilities
{
    public static class OutputComparer
    {
        public static bool AreEqual(string expected, string actual)
        {
            var normalizedExpected = Normalize(expected);
            var normalizedActual = Normalize(actual);
            return string.Equals(normalizedExpected, normalizedActual, StringComparison.Ordinal);
        }

        private static string Normalize(string value)
        {
            if (value is null)
            {
                return string.Empty;
            }

            var lines = value
                .Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(line => string.Join(' ', line.Split(' ', StringSplitOptions.RemoveEmptyEntries)).Trim());

            return string.Join('\n', lines).Trim();
        }
    }
}
