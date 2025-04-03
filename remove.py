import os

# The EXACT start piece you gave (with the same indentation/newline).
start_snippet = """(function() {
    var KeY='', iFD=494-483;"""

# The EXACT end piece you gave.
end_snippet = "})()"

def remove_between_markers(content, start_marker, end_marker):
    """
    Remove everything from the first occurrence of start_marker
    through and including the first occurrence of end_marker
    that appears after it. Repeat until none remain.
    """
    while True:
        start_index = content.find(start_marker)
        if start_index == -1:
            break  # No more start markers

        end_index = content.find(end_marker, start_index)
        if end_index == -1:
            break  # Found a start but no matching end

        # Remove from start_index through end_index + length of end_marker
        content = content[:start_index] + content[end_index + len(end_marker):]

    return content

def process_file(file_path):
    """Read an HTML file, remove everything between the snippet markers, and write it back."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return

    new_content = remove_between_markers(content, start_snippet, end_snippet)

    if new_content != content:
        # Means we removed at least one snippet block
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Removed snippet(s) in {file_path}")
        except Exception as e:
            print(f"Error writing {file_path}: {e}")
    else:
        # No changes were made
        print(f"No matching snippet found in {file_path}")

def process_target_folder(target_folder):
    """Look for .html files within target_folder and remove matching snippet blocks if found."""
    for root, dirs, files in os.walk(target_folder):
        for file in files:
            if file.lower().endswith(".html"):
                file_path = os.path.join(root, file)
                process_file(file_path)

def main():
    html_dir = "./html"
    if not os.path.isdir(html_dir):
        print(f"Directory '{html_dir}' does not exist.")
        return

    # List all subdirectories in ./html/
    for subfolder in os.listdir(html_dir):
        subfolder_path = os.path.join(html_dir, subfolder)
        if os.path.isdir(subfolder_path):
            # Check for 'game' or 'gamereal'
            game_path = os.path.join(subfolder_path, "game")
            gamereal_path = os.path.join(subfolder_path, "gamereal")

            target = None
            if os.path.isdir(game_path):
                target = game_path
            elif os.path.isdir(gamereal_path):
                target = gamereal_path

            if target:
                print(f"\nProcessing folder: {target}")
                process_target_folder(target)
            else:
                print(f"\nNo 'game' or 'gamereal' subdirectory found in: {subfolder_path}")

if __name__ == "__main__":
    main()