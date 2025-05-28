import { useCallback, useRef } from "react";
import html2canvas, { Options } from "html2canvas-pro";
import { jsPDF, jsPDFOptions } from "jspdf";

enum Resolution {
  LOW = 1,
  NORMAL = 2,
  MEDIUM = 3,
  HIGH = 7,
  EXTREME = 12,
}
enum Margin {
  NONE = 0,
  SMALL = 5,
  MEDIUM = 10,
  LARGE = 25,
}

interface CanvasConversionOptions extends Pick<Options, "useCORS" | "logging"> {
  mimeType: "image/jpeg" | "image/png";
  qualityRatio: number;
}

type DetailedMargin = {
  top: Margin | number;
  right: Margin | number;
  bottom: Margin | number;
  left: Margin | number;
};

interface PageConversionOptions {
  margin: DetailedMargin | Margin | number;
  format: jsPDFOptions["format"];
  orientation: jsPDFOptions["orientation"];
}

interface UsePdfParams {
  filename?: `${string}.pdf`;
  method?: "save" | "open" | "build";
  resolution?: Resolution | number;
  page?: Partial<PageConversionOptions>;
  canvas?: Partial<CanvasConversionOptions>;
  overrides?: {
    pdf?: Partial<jsPDFOptions>;
    canvas?: Partial<Options>;
  };
}

const multiplier = 3.77952755906;
const defaultOptions: UsePdfParams = {
  method: "save",
  resolution: Resolution.MEDIUM,
  page: {
    margin: Margin.NONE,
    format: "A4",
    orientation: "portrait",
  },
  canvas: {
    mimeType: "image/jpeg",
    qualityRatio: 1,
    useCORS: true,
    logging: false,
  },
  overrides: {},
};

class Converter {
  canvas: HTMLCanvasElement;
  options: UsePdfParams;
  pdf: jsPDF;

  constructor(canvas: HTMLCanvasElement, options: UsePdfParams) {
    this.canvas = canvas;
    this.options = options;
    this.pdf = new jsPDF({
      format: this.options.page?.format,
      orientation: this.options?.page?.orientation,
      ...this.options.overrides?.pdf,
      unit: "mm",
    });
  }

  getMarginTopMM() {
    const margin =
      typeof this.options.page!.margin === "object"
        ? this.options.page!.margin.top
        : this.options.page!.margin;
    return Number(margin);
  }
  getMarginLeftMM() {
    const margin =
      typeof this.options.page!.margin === "object"
        ? this.options.page!.margin.left
        : this.options.page!.margin;
    return Number(margin);
  }
  getMarginRightMM() {
    const margin =
      typeof this.options.page!.margin === "object"
        ? this.options.page!.margin.right
        : this.options.page!.margin;
    return Number(margin);
  }
  getMarginBottomMM() {
    const margin =
      typeof this.options.page!.margin === "object"
        ? this.options.page!.margin.bottom
        : this.options.page!.margin;
    return Number(margin);
  }
  getMarginTop() {
    return this.getMarginTopMM() * multiplier;
  }
  getMarginBottom() {
    return this.getMarginBottomMM() * multiplier;
  }
  getMarginLeft() {
    return this.getMarginLeftMM() * multiplier;
  }
  getMarginRight() {
    return this.getMarginRightMM() * multiplier;
  }
  getScale() {
    return this.options.resolution!;
  }
  getPageHeight() {
    return this.getPageHeightMM() * multiplier;
  }
  getPageHeightMM() {
    return this.pdf.internal.pageSize.height;
  }
  getPageWidthMM() {
    return this.pdf.internal.pageSize.width;
  }
  getPageWidth() {
    return this.getPageWidthMM() * multiplier;
  }
  getOriginalCanvasWidth() {
    return this.canvas.width / this.getScale();
  }
  getOriginalCanvasHeight() {
    return this.canvas.height / this.getScale();
  }
  getCanvasPageAvailableHeight() {
    return (
      this.getPageAvailableHeight() *
      this.getScale() *
      this.getHorizontalFitFactor()
    );
  }
  getPageAvailableWidth() {
    return this.getPageWidth() - (this.getMarginLeft() + this.getMarginRight());
  }
  getPageAvailableHeight() {
    return (
      this.getPageHeight() - (this.getMarginTop() + this.getMarginBottom())
    );
  }
  getPageAvailableWidthMM() {
    return this.getPageAvailableWidth() / multiplier;
  }
  getPageAvailableHeightMM() {
    return this.getPageAvailableHeight() / multiplier;
  }
  getNumberPages() {
    return Math.ceil(this.canvas.height / this.getCanvasPageAvailableHeight());
  }
  getHorizontalFitFactor() {
    if (this.getPageAvailableWidth() < this.getOriginalCanvasWidth())
      return this.getOriginalCanvasWidth() / this.getPageAvailableWidth();
    return 1;
  }
  getCanvasOffsetY(pageNumber: number) {
    return this.getCanvasPageAvailableHeight() * (pageNumber - 1);
  }
  getCanvasHeightLeft(pageNumber: number) {
    return this.canvas.height - this.getCanvasOffsetY(pageNumber);
  }
  getCanvasPageHeight(pageNumber: number) {
    if (this.canvas.height < this.getCanvasPageAvailableHeight())
      return this.canvas.height;
    const canvasHeightPending = this.getCanvasHeightLeft(pageNumber);
    return canvasHeightPending < this.getCanvasPageAvailableHeight()
      ? canvasHeightPending
      : this.getCanvasPageAvailableHeight();
  }
  getCanvasPageWidth() {
    return this.canvas.width;
  }
  createCanvasPage(pageNumber: number) {
    const canvasPageWidth = this.getCanvasPageWidth();
    const canvasPageHeight = this.getCanvasPageHeight(pageNumber);
    const canvasPage = document.createElement("canvas");
    canvasPage.setAttribute("width", String(canvasPageWidth));
    canvasPage.setAttribute("height", String(canvasPageHeight));
    const ctx = canvasPage.getContext("2d");
    ctx?.drawImage(
      this.canvas,
      0,
      this.getCanvasOffsetY(pageNumber),
      this.canvas.width,
      canvasPageHeight,
      0,
      0,
      this.canvas.width,
      canvasPageHeight,
    );
    return canvasPage;
  }
  convert() {
    let pageNumber = 1;
    const numberPages = this.getNumberPages();
    while (pageNumber <= numberPages) {
      if (pageNumber > 1)
        this.pdf.addPage(
          this.options.page!.format,
          this.options.page!.orientation,
        );
      const canvasPage = this.createCanvasPage(pageNumber);
      const pageImageDataURL = canvasPage.toDataURL(
        this.options.canvas!.mimeType,
        this.options.canvas!.qualityRatio,
      );
      this.pdf.setPage(pageNumber);
      this.pdf.addImage({
        imageData: pageImageDataURL,
        width:
          canvasPage.width /
          (this.getScale() * multiplier * this.getHorizontalFitFactor()),
        height:
          canvasPage.height /
          (this.getScale() * multiplier * this.getHorizontalFitFactor()),
        x: this.getMarginLeftMM(),
        y: this.getMarginTopMM(),
      });
      pageNumber += 1;
    }
    return this.pdf;
  }
}

function getOptions(options?: UsePdfParams) {
  if (!options) return defaultOptions;

  return {
    ...defaultOptions,
    ...options,
    canvas: {
      ...defaultOptions.canvas,
      ...options.canvas,
    },
    page: {
      ...defaultOptions.page,
      ...options.page,
    },
  };
}

function usePdf(params?: UsePdfParams) {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const targetRef = useRef<any>(null);

  const toPDF = useCallback(
    (toPdfOptions?: UsePdfParams) => {
      const targetElement = targetRef.current;

      if (!(targetElement instanceof HTMLElement)) {
        console.log("Unable to get the target element.");
        return;
      }

      return generatePdf(targetElement, params ?? toPdfOptions);
    },
    [targetRef, params],
  );

  return { targetRef, toPDF };
}

async function generatePdf(
  targetElement: HTMLElement,
  customOptions?: UsePdfParams,
) {
  const options = getOptions(customOptions);
  const canvas = await html2canvas(targetElement, {
    useCORS: options?.canvas?.useCORS,
    logging: options?.canvas?.logging,
    scale: options?.resolution,
    windowWidth: 1440,
    ...options?.overrides?.canvas,
  });
  const converter = new Converter(canvas, options);
  const pdf = converter.convert();

  switch (options?.method) {
    case "build": {
      return pdf;
    }

    case "open": {
      window.open(pdf.output("bloburl"), "_blank");

      return pdf;
    }

    case "save":
    default: {
      const pdfFilename = options?.filename ?? `${new Date().getTime()}.pdf`;

      await pdf.save(pdfFilename, {
        returnPromise: true,
      });
      return pdf;
    }
  }
}

export { usePdf };
