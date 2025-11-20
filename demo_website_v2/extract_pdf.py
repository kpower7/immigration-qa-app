"""
Extract USCIS Policy Manual PDF and create RAG corpus
"""
import os
import sys
from pathlib import Path

def extract_pdf_to_corpus():
    """Extract PDF content and split into chunks for RAG"""
    
    # Check if PyPDF2 is available, if not provide instructions
    try:
        import PyPDF2
    except ImportError:
        print("PyPDF2 not installed. Installing...")
        os.system("pip install PyPDF2")
        import PyPDF2
    
    pdf_path = r"C:\Users\k_pow\OneDrive\Documents\ImmigrationBot\ElevenLabs\USCIS_Policy_Manual.pdf"
    corpus_dir = Path("backend/rag/corpus")
    
    if not os.path.exists(pdf_path):
        print(f"PDF not found at: {pdf_path}")
        return False
    
    print(f"Extracting PDF: {pdf_path}")
    
    # Extract text from PDF
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        full_text = ""
        
        print(f"Processing {len(pdf_reader.pages)} pages...")
        
        for page_num, page in enumerate(pdf_reader.pages):
            try:
                text = page.extract_text()
                if text.strip():
                    full_text += f"\n\n--- Page {page_num + 1} ---\n\n{text}"
                    
                # Progress indicator
                if (page_num + 1) % 50 == 0:
                    print(f"Processed {page_num + 1} pages...")
                    
            except Exception as e:
                print(f"Error processing page {page_num + 1}: {e}")
                continue
    
    if not full_text.strip():
        print("No text extracted from PDF")
        return False
    
    # Split into chunks (approximately 2000 characters each)
    chunk_size = 2000
    chunks = []
    
    # Split by sections or paragraphs first
    sections = full_text.split('\n\n')
    current_chunk = ""
    
    for section in sections:
        if len(current_chunk) + len(section) > chunk_size and current_chunk:
            chunks.append(current_chunk.strip())
            current_chunk = section
        else:
            current_chunk += "\n\n" + section if current_chunk else section
    
    # Add the last chunk
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    
    print(f"Created {len(chunks)} text chunks")
    
    # Save chunks as individual files
    corpus_dir.mkdir(parents=True, exist_ok=True)
    
    # Clear existing files
    for existing_file in corpus_dir.glob("*.txt"):
        existing_file.unlink()
    
    for i, chunk in enumerate(chunks):
        if chunk.strip():  # Only save non-empty chunks
            chunk_file = corpus_dir / f"uscis_policy_chunk_{i+1:03d}.txt"
            with open(chunk_file, 'w', encoding='utf-8') as f:
                f.write(chunk)
    
    print(f"Saved {len(chunks)} chunks to {corpus_dir}")
    
    # Remove the old index so it gets rebuilt
    index_path = Path("backend/rag/index.pkl")
    if index_path.exists():
        index_path.unlink()
        print("Removed old RAG index - will be rebuilt automatically")
    
    return True

if __name__ == "__main__":
    success = extract_pdf_to_corpus()
    if success:
        print("\n✅ PDF extraction complete!")
        print("🔄 Restart your backend server to rebuild the RAG index")
        print("🧪 Test the USCIS Q&A page - it should now have real policy content!")
    else:
        print("\n❌ PDF extraction failed")
