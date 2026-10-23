// Cuts the person out of a photo with a plain background and saves a transparent PNG,
// using the Mac's built-in subject detection (the same as "Remove Background" in Preview).
// Usage: swift tools/cutout.swift input.png output.png
import Foundation
import Vision
import CoreImage
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
guard args.count == 3 else { print("usage: cutout input output.png"); exit(1) }
let input = URL(fileURLWithPath: args[1]), output = URL(fileURLWithPath: args[2])
guard let image = CIImage(contentsOf: input) else { print("can't read \(input.path)"); exit(1) }

let request = VNGenerateForegroundInstanceMaskRequest()
let handler = VNImageRequestHandler(ciImage: image)
try handler.perform([request])
guard let result = request.results?.first else { print("no subject found"); exit(1) }
let mask = try result.generateScaledMaskForImage(forInstances: result.allInstances, from: handler)

let cut = image.applyingFilter("CIBlendWithMask", parameters: [
  kCIInputBackgroundImageKey: CIImage.empty(),
  kCIInputMaskImageKey: CIImage(cvPixelBuffer: mask),
])
let context = CIContext()
guard let cg = context.createCGImage(cut, from: image.extent),
      let dest = CGImageDestinationCreateWithURL(output as CFURL, UTType.png.identifier as CFString, 1, nil) else { exit(1) }
CGImageDestinationAddImage(dest, cg, nil)
CGImageDestinationFinalize(dest)
print("saved \(output.path)")
