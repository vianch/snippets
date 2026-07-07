import SupportedLanguages from "@/lib/config/languages";

export const enum PreviewKind {
	Console = "console",
	Html = "html",
	Markdown = "markdown",
	None = "none",
}

export const enum ConsoleMessageLevel {
	Done = "done",
	Error = "error",
	Info = "info",
	Log = "log",
	Warn = "warn",
}

export const LanguagePreviewKinds: Partial<
	Record<SupportedLanguages, PreviewKind>
> = {
	[SupportedLanguages.HTML]: PreviewKind.Html,
	[SupportedLanguages.JavaScript]: PreviewKind.Console,
	[SupportedLanguages.Markdown]: PreviewKind.Markdown,
	[SupportedLanguages.TypeScript]: PreviewKind.Console,
};

// Levels a sandbox message may carry into the rendered entry list; anything
// else coming out of the (untrusted) frame is dropped.
export const ConsoleEntryLevels: readonly ConsoleMessageLevel[] = [
	ConsoleMessageLevel.Error,
	ConsoleMessageLevel.Info,
	ConsoleMessageLevel.Log,
	ConsoleMessageLevel.Warn,
];

export const ConsoleMessageSource = "snippets-console";

export const ConsoleRunMessageSource = "snippets-console-run";

export const ConsoleRunTimeoutMs = 5000;

// The HTML preview frame is fully sandboxed (sandbox="", opaque origin, no
// scripts); this CSP is defense in depth on top of that: deny everything
// except inline styles and images.
export const HtmlPreviewContentSecurityPolicy =
	"default-src 'none'; img-src data: https:; style-src 'unsafe-inline'";

// Bootstrap document for the JS/TS console sandbox. Runs inside an iframe
// with sandbox="allow-scripts" only: opaque origin, so no cookies, storage,
// or parent DOM access. The CSP additionally denies all network
// (connect/img/font/frame/etc. via default-src 'none'); 'unsafe-eval' is
// required for the new Function() execution and 'unsafe-inline' for this
// bootstrap script itself. Snippet code arrives via postMessage (never
// embedded in the document), console output leaves the same way as plain
// strings. The console shim covers the common Console API surface (log,
// info, warn, error, debug, dir, table, group/groupCollapsed/groupEnd,
// count/countReset, time/timeLog/timeEnd, assert, trace); every method maps
// onto the four ConsoleMessageLevel entry levels the parent accepts, with
// tables rendered as monospace text and groups rendered as indentation.
export const ConsoleSandboxDocument = `<!doctype html>
<html>
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'" />
	</head>
	<body>
		<script>
			(function () {
				"use strict";

				var indentDepth = 0;
				var counters = {};
				var timers = {};

				var repeatText = function (text, count) {
					return new Array(count + 1).join(text);
				};

				var indentText = function (text) {
					if (indentDepth === 0) {
						return text;
					}

					var prefix = repeatText("  ", indentDepth);

					return String(text)
						.split("\\n")
						.map(function (line) {
							return prefix + line;
						})
						.join("\\n");
				};

				var post = function (level, text) {
					window.parent.postMessage(
						{ level: level, source: "${ConsoleMessageSource}", text: indentText(text) },
						"*"
					);
				};

				var format = function (value) {
					if (typeof value === "string") {
						return value;
					}

					if (value instanceof Error) {
						return value.name + ": " + value.message;
					}

					try {
						var json = JSON.stringify(value);

						return json === undefined ? String(value) : json;
					} catch (serializationError) {
						return String(value);
					}
				};

				var formatAll = function (values) {
					return Array.prototype.map.call(values, format).join(" ");
				};

				var toLabelKey = function (label) {
					return label === undefined ? "default" : String(label);
				};

				var isRowObject = function (row) {
					return row !== null && typeof row === "object";
				};

				var buildTable = function (data, columns) {
					if (!isRowObject(data)) {
						return format(data);
					}

					var rowKeys = Object.keys(data);
					var columnNames = [];

					if (Array.isArray(columns)) {
						columnNames = columns.map(String);
					} else {
						var seenColumns = {};

						rowKeys.forEach(function (rowKey) {
							var row = data[rowKey];

							if (!isRowObject(row)) {
								return;
							}

							Object.keys(row).forEach(function (columnName) {
								if (!seenColumns[columnName]) {
									seenColumns[columnName] = true;
									columnNames.push(columnName);
								}
							});
						});
					}

					var hasValuesColumn = rowKeys.some(function (rowKey) {
						return !isRowObject(data[rowKey]);
					});
					var header = ["(index)"].concat(columnNames);

					if (hasValuesColumn) {
						header.push("Values");
					}

					var bodyRows = rowKeys.map(function (rowKey) {
						var row = data[rowKey];
						var cells = [rowKey];

						columnNames.forEach(function (columnName) {
							cells.push(
								isRowObject(row) && columnName in row ? format(row[columnName]) : ""
							);
						});

						if (hasValuesColumn) {
							cells.push(isRowObject(row) ? "" : format(row));
						}

						return cells;
					});

					var columnWidths = header.map(function (headerCell, columnIndex) {
						var width = String(headerCell).length;

						bodyRows.forEach(function (cells) {
							var cellWidth = String(cells[columnIndex]).length;

							if (cellWidth > width) {
								width = cellWidth;
							}
						});

						return width;
					});

					var padCell = function (cell, width) {
						var text = String(cell);

						return text + repeatText(" ", width - text.length);
					};

					var renderRow = function (cells) {
						var rendered = cells.map(function (cell, columnIndex) {
							return padCell(cell, columnWidths[columnIndex]);
						});

						return "| " + rendered.join(" | ") + " |";
					};

					var divider =
						"+" +
						columnWidths
							.map(function (width) {
								return repeatText("-", width + 2);
							})
							.join("+") +
						"+";

					var lines = [divider, renderRow(header), divider];

					bodyRows.forEach(function (cells) {
						lines.push(renderRow(cells));
					});
					lines.push(divider);

					return lines.join("\\n");
				};

				["debug", "error", "info", "log", "warn"].forEach(function (level) {
					var entryLevel = level === "debug" ? "log" : level;

					console[level] = function () {
						post(entryLevel, formatAll(arguments));
					};
				});

				console.dir = function (value) {
					post("log", format(value));
				};

				console.table = function (data, columns) {
					post("log", buildTable(data, columns));
				};

				console.group = function () {
					post("log", arguments.length > 0 ? formatAll(arguments) : "console.group");
					indentDepth += 1;
				};

				console.groupCollapsed = console.group;

				console.groupEnd = function () {
					if (indentDepth > 0) {
						indentDepth -= 1;
					}
				};

				console.count = function (label) {
					var key = toLabelKey(label);

					counters[key] = (counters[key] || 0) + 1;
					post("log", key + ": " + counters[key]);
				};

				console.countReset = function (label) {
					counters[toLabelKey(label)] = 0;
				};

				console.time = function (label) {
					timers[toLabelKey(label)] = performance.now();
				};

				console.timeLog = function (label) {
					var key = toLabelKey(label);

					if (timers[key] === undefined) {
						post("warn", "Timer '" + key + "' does not exist");

						return;
					}

					post("log", key + ": " + (performance.now() - timers[key]).toFixed(2) + " ms");
				};

				console.timeEnd = function (label) {
					var key = toLabelKey(label);

					if (timers[key] === undefined) {
						post("warn", "Timer '" + key + "' does not exist");

						return;
					}

					post("log", key + ": " + (performance.now() - timers[key]).toFixed(2) + " ms");
					delete timers[key];
				};

				console.assert = function (condition) {
					if (condition) {
						return;
					}

					var details = Array.prototype.slice.call(arguments, 1).map(format).join(" ");

					post("error", details ? "Assertion failed: " + details : "Assertion failed");
				};

				console.trace = function () {
					var details = formatAll(arguments);
					var stack = String(new Error().stack || "");
					var stackLines = stack.split("\\n").slice(2).join("\\n");

					post(
						"log",
						"Trace" + (details ? ": " + details : "") + (stackLines ? "\\n" + stackLines : "")
					);
				};

				window.addEventListener("error", function (event) {
					post("error", event.message);
				});

				window.addEventListener("unhandledrejection", function (event) {
					post("error", format(event.reason));
				});

				window.addEventListener("message", function (event) {
					if (event.source !== window.parent) {
						return;
					}

					var data = event.data;

					if (!data || data.source !== "${ConsoleRunMessageSource}") {
						return;
					}

					var finish = function () {
						post("done", "");
					};

					try {
						var execute = new Function(
							'"use strict"; return (async function () {\\n' +
								data.code +
								'\\n}).call(undefined);'
						);

						execute().then(finish, function (runError) {
							post("error", format(runError));
							finish();
						});
					} catch (runError) {
						post("error", format(runError));
						finish();
					}
				});
			})();
		</script>
	</body>
</html>`;
