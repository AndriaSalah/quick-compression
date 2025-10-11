"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video } from "lucide-react";
import { CompressionOptions, VideoCompressionOptions } from "@/types";

interface VideoSettingsProps {
	options: VideoCompressionOptions;
	onOptionsChange: (options: VideoCompressionOptions) => void;
}

export function VideoSettings({ options, onOptionsChange }: VideoSettingsProps) {
	const updateOption = (newOptions: VideoCompressionOptions) => {
		onOptionsChange({
			...options,
			...newOptions,
		});
		console.log("Updated options:", { ...options, ...newOptions });
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center space-x-2">
				<Video className="w-5 h-5 text-green-500" />
				<Label className="text-lg font-medium">Video Settings</Label>
			</div>

			{/* Video Codec */}
			<div className="space-y-2">
				<Label>Video Codec</Label>
				<Select value={options.vcodec || "libx264"} onValueChange={(value) => updateOption({ vcodec: value })}>
					<SelectTrigger>
						<SelectValue placeholder="Select codec" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="libx264">MP4 (H.264 codec)</SelectItem>
						<SelectItem value="libvpx">WebM (VPX codec)</SelectItem>
					</SelectContent>
				</Select>
			</div>
			{/* Audio bitrate */}
			{options.vcodec === "libx264" && (
				<div className="space-y-2">
					<Label>Audio Bitrate</Label>
					<Select value={options.sampleRate || "128k"} onValueChange={(value) => updateOption({ sampleRate: value })}>
						<SelectTrigger>
							<SelectValue placeholder="Select audio s" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="32k">32 kbps</SelectItem>
							<SelectItem value="64k">64 kbps</SelectItem>
							<SelectItem value="96k">96 kbps</SelectItem>
							<SelectItem value="128k">128 kbps</SelectItem>
							<SelectItem value="192k">192 kbps</SelectItem>
							<SelectItem value="256k">256 kbps</SelectItem>
							<SelectItem value="320k">320 kbps</SelectItem>
						</SelectContent>
					</Select>
				</div>
			)}

			{/* Preset */}
			<div className="space-y-2">
				<Label>Encoding Speed</Label>
				<Select value={options.preset || "medium"} onValueChange={(value) => updateOption({ preset: value })}>
					<SelectTrigger>
						<SelectValue placeholder="Select preset" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ultrafast">Ultra Fast (Largest files)</SelectItem>
						<SelectItem value="fast">Fast</SelectItem>
						<SelectItem value="medium">Medium (Balanced)</SelectItem>
						<SelectItem value="slow">Slow (Better compression)</SelectItem>
						<SelectItem value="veryslow">Very Slow (Best compression)</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* CRF Quality */}
			<div className="space-y-3">
				<div className="flex justify-between items-center">
					<Label>Quality (CRF)</Label>
					<span className="text-sm text-gray-500">{options.crf || 23}</span>
				</div>
				<Slider
					value={[options.crf || 23]}
					onValueChange={(value) => updateOption({ crf: value[0] })}
					max={51}
					min={0}
					step={1}
					className="w-full"
				/>
				<p className="text-xs text-gray-500">Lower values = better quality, larger files. Recommended: 18-28</p>
			</div>

			{/* Resolution Preset */}
			<div className="space-y-2">
				<Label>Resolution Preset</Label>
				<Select
					value={(() => {
						if (options.maxWidth === 1920 && options.maxHeight === 1080) return "1080p";
						if (options.maxWidth === 1280 && options.maxHeight === 720) return "720p";
						if (options.maxWidth === 2560 && options.maxHeight === 1440) return "1440p";
						if (options.maxWidth === 3840 && options.maxHeight === 2160) return "4k";
						if (!options.maxWidth && !options.maxHeight) return "original";
						return "custom";
					})()}
					onValueChange={(value) => {
						if (value === "1080p") updateOption({ maxWidth: 1920, maxHeight: 1080, scale: "scale=1920:1080" });
						else if (value === "720p") updateOption({ maxWidth: 1280, maxHeight: 720, scale: "scale=1280:720" });
						else if (value === "1440p") updateOption({ maxWidth: 2560, maxHeight: 1440, scale: "scale=2560:1440" });
						else if (value === "4k") updateOption({ maxWidth: 3840, maxHeight: 2160, scale: "scale=3840:2160" });
						else if (value === "original")
							updateOption({ maxWidth: undefined, maxHeight: undefined, scale: undefined });
						else updateOption({});
					}}>
					<SelectTrigger>
						<SelectValue placeholder="Select resolution" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="original">Keep Original</SelectItem>
						<SelectItem value="720p">720p (1280x720)</SelectItem>
						<SelectItem value="1080p">1080p (1920x1080)</SelectItem>
						<SelectItem value="1440p">1440p (2560x1440)</SelectItem>
						<SelectItem value="4k">4K (3840x2160)</SelectItem>
					</SelectContent>
				</Select>
				{(() => {
					const preset = [
						{ w: 1920, h: 1080 },
						{ w: 1280, h: 720 },
						{ w: 2560, h: 1440 },
						{ w: 3840, h: 2160 },
					];
					const isCustom =
						!preset.some((p) => p.w === options.maxWidth && p.h === options.maxHeight) &&
						(options.maxWidth || options.maxHeight);
					if (isCustom) {
						return (
							<div className="grid grid-cols-2 gap-4 mt-2">
								<div className="space-y-2">
									<Label>Max Width (px)</Label>
									<Input
										type="number"
										value={options.maxWidth || ""}
										onChange={(e) => updateOption({ maxWidth: parseInt(e.target.value) })}
										min={320}
										max={4096}
										step={16}
									/>
								</div>
								<div className="space-y-2">
									<Label>Max Height (px)</Label>
									<Input
										type="number"
										value={options.maxHeight || ""}
										onChange={(e) => updateOption({ maxHeight: parseInt(e.target.value) })}
										min={240}
										max={2160}
										step={16}
									/>
								</div>
							</div>
						);
					}
					return null;
				})()}
			</div>
		</div>
	);
}
