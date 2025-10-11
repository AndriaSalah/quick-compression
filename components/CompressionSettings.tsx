"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings } from "lucide-react";
import { CompressionOptions } from "@/types";
import { getSmartDefaults } from "@/utils/compression-defaults";
import { SmartPresets } from "./settings/SmartPresets";
import { ImageSettings } from "./settings/ImageSettings";
import { VideoSettings } from "./settings/VideoSettings";
import { AudioSettings } from "./settings/AudioSettings";
import { PdfSettings } from "./settings/PdfSettings";
import { CustomArgs } from "./settings/CustomArgs";
import { getSelectedFilesTypes } from "@/lib/utils/get-selected-files-types";
import { useCompressionStore } from "@/store/compression-store";

interface CompressionSettingsProps {
	selectedFiles: File[];
}

export function CompressionSettings({ selectedFiles }: CompressionSettingsProps) {
	const {
		audioOptions,
		videoOptions,
		imageOptions,
		pdfOptions,
		setAudioOptions,
		setVideoOptions,
		setImageOptions,
		setPdfOptions,
	} = useCompressionStore();
	const { hasImages, hasVideos, hasAudio, hasPdfs } = getSelectedFilesTypes(selectedFiles);


	if (selectedFiles.length === 0) {
		return (
			<Card>
				<CardContent className="p-6 text-center text-gray-500">
					<Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
					<p>Select files to configure compression settings</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			{hasImages && (
				<Card>
					<CardContent>
						<ImageSettings options={imageOptions} onOptionsChange={setImageOptions} />
					</CardContent>
				</Card>
			)}

			{hasVideos && (
				<Card>
					<CardContent>
						<VideoSettings options={videoOptions} onOptionsChange={setVideoOptions} />
					</CardContent>
				</Card>
			)}

			{hasAudio && (
				<Card>
					<CardContent>
						<AudioSettings options={audioOptions} onOptionsChange={setAudioOptions} />
					</CardContent>
				</Card>
			)}
			{/* {hasPdfs && (
				<Card>
					<CardContent>
						<PdfSettings options={pdfOptions} onOptionsChange={setPdfOptions} />
					</CardContent>
				</Card>
			)} */}

			{/* No file type selected message */}
			{!hasImages && !hasAudio && !hasVideos && !hasPdfs && (
				<Card>
					<CardContent>
						<div className="text-center py-8 text-gray-500">
							<Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
							<p>Upload supported files to see compression options</p>
							<p className="text-sm mt-1">Supports images, videos, audio, and PDFs</p>
						</div>
					</CardContent>
				</Card>
			)}
		</>
	);
}
