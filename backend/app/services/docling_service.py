from pathlib import Path
from typing import Any, Dict, List

from docling.document_converter import DocumentConverter
from docling.pipeline.standard_pdf_pipeline import StandardPdfPipeline
from loguru import logger


converter = DocumentConverter(pipeline=StandardPdfPipeline())


def parse_document(file_path: Path) -> List[Dict[str, Any]]:
    """
    Parse PDFs/images with Docling and emit structured chunks for embeddings.
    """
    logger.info(f"Parsing document with Docling: {file_path}")
    with file_path.open("rb") as f:
        result = converter.convert(f)

    chunks: List[Dict[str, Any]] = []

    for section in result.sections:
        text = section.extracted_text.strip()
        if not text:
            continue
        chunks.append(
            {
                "section": section.section_type,
                "text": text,
                "metadata": {
                    "page": section.page_number,
                    "heading": section.heading,
                },
            }
        )

    logger.info(f"Docling emitted {len(chunks)} chunks")
    return chunks

