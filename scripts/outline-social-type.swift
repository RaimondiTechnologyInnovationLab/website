// Run on macOS: swift scripts/outline-social-type.swift public/og-til-cells-2026-09-30-v2.svg
// CoreText uses the same installed faces as the macOS hero. Outlines keep SVG
// rasterizers from substituting a different italic when creating the PNG.
import Foundation
import CoreText
import CoreGraphics

struct Label {
    let text: String
    let face: String
    let size: CGFloat
    let tracking: CGFloat
    let x: CGFloat
    let y: CGFloat
    let fill: String
}

let labels: [Label] = [
    .init(text: "Technology Innovation Lab", face: "HelveticaNeue-Bold", size: 23, tracking: -0.575, x: 155, y: 74, fill: "#f5f3ed"),
    .init(text: "A lab in the making", face: "HelveticaNeue-Bold", size: 16, tracking: 1.12, x: 155, y: 100, fill: "#f78c7c"),
    .init(text: "GENOMICS. MULTIOMICS. AUTOMATION.", face: "HelveticaNeue-Bold", size: 14, tracking: 1.96, x: 58, y: 185, fill: "#e2e5e6"),
    .init(text: "Imagining what biology needs", face: "HelveticaNeue-Medium", size: 70, tracking: -3.5, x: 54, y: 270, fill: "#fff"),
    .init(text: "Next...", face: "IowanOldStyle-Italic", size: 167, tracking: -11.69, x: 48, y: 430, fill: "#f36b57"),
    .init(text: "Building technologies to make the unseen measurable.", face: "HelveticaNeue", size: 23, tracking: 0, x: 58, y: 510, fill: "#e1e5e8"),
]

func number(_ value: CGFloat) -> String {
    String(format: "%.3f", locale: Locale(identifier: "en_US_POSIX"), Double(value))
}

func point(_ value: CGPoint) -> String {
    "\(number(value.x)) \(number(value.y))"
}

func escape(_ value: String) -> String {
    value.replacingOccurrences(of: "&", with: "&amp;")
        .replacingOccurrences(of: "\"", with: "&quot;")
        .replacingOccurrences(of: "<", with: "&lt;")
}

var svgLines = ["<g id=\"hero-typography\">"]
for label in labels {
    let font = CTFontCreateWithName(label.face as CFString, label.size, nil)
    guard CTFontCopyPostScriptName(font) as String == label.face else {
        fatalError("Missing required font: \(label.face)")
    }
    let attributes: [NSAttributedString.Key: Any] = [
        NSAttributedString.Key(kCTFontAttributeName as String): font,
        NSAttributedString.Key(kCTTrackingAttributeName as String): label.tracking,
    ]
    let line = CTLineCreateWithAttributedString(NSAttributedString(string: label.text, attributes: attributes))
    var commands: [String] = []
    for run in CTLineGetGlyphRuns(line) as! [CTRun] {
        let count = CTRunGetGlyphCount(run)
        var glyphs = [CGGlyph](repeating: 0, count: count)
        var positions = [CGPoint](repeating: .zero, count: count)
        CTRunGetGlyphs(run, CFRange(location: 0, length: 0), &glyphs)
        CTRunGetPositions(run, CFRange(location: 0, length: 0), &positions)
        for index in 0..<count {
            var transform = CGAffineTransform(a: 1, b: 0, c: 0, d: -1,
                tx: label.x + positions[index].x, ty: label.y - positions[index].y)
            guard let path = CTFontCreatePathForGlyph(font, glyphs[index], &transform) else { continue }
            path.applyWithBlock { element in
                let e = element.pointee
                switch e.type {
                case .moveToPoint: commands.append("M\(point(e.points[0]))")
                case .addLineToPoint: commands.append("L\(point(e.points[0]))")
                case .addQuadCurveToPoint: commands.append("Q\(point(e.points[0])) \(point(e.points[1]))")
                case .addCurveToPoint: commands.append("C\(point(e.points[0])) \(point(e.points[1])) \(point(e.points[2]))")
                case .closeSubpath: commands.append("Z")
                @unknown default: fatalError("Unsupported glyph path element")
                }
            }
        }
    }
    svgLines.append("<g role=\"img\" aria-label=\"\(escape(label.text))\" data-font=\"\(label.face)\" fill=\"\(label.fill)\">")
    svgLines.append("<title>\(escape(label.text))</title>")
    svgLines.append("<path d=\"\(commands.joined(separator: " "))\"/>")
    svgLines.append("</g>")
}
svgLines.append("</g>")
let typography = svgLines.joined(separator: "\n")
if CommandLine.arguments.count == 2 {
    let file = CommandLine.arguments[1]
    let source = try String(contentsOfFile: file, encoding: .utf8)
    let start = "<!-- hero-typography:start -->"
    let end = "<!-- hero-typography:end -->"
    guard let first = source.range(of: start), let last = source.range(of: end),
          first.upperBound <= last.lowerBound else {
        fatalError("SVG must contain the hero-typography start/end markers")
    }
    let updated = source.replacingCharacters(in: first.upperBound..<last.lowerBound,
        with: "\n\(typography)\n")
    try updated.write(toFile: file, atomically: true, encoding: .utf8)
} else {
    print(typography)
}
