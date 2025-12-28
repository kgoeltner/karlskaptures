import { listCloudinaryFolders, listAllFoldersWithImages } from '../utils/photos';

export default async function TestFoldersPage() {
  const rootFolders = await listCloudinaryFolders();
  const allFoldersWithImages = await listAllFoldersWithImages();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">Cloudinary Folders & Images</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Root Folders:</h2>
          <pre className="bg-neutral-900 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(rootFolders, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Complete Structure with Images:</h2>
          <pre className="bg-neutral-900 p-4 rounded overflow-auto text-sm max-h-[600px]">
            {JSON.stringify(allFoldersWithImages, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Folder Tree with Images:</h2>
          <div className="bg-neutral-900 p-4 rounded space-y-6">
            {Object.entries(allFoldersWithImages).map(([folder, data]) => (
              <div key={folder} className="border-b border-neutral-700 pb-4 last:border-0">
                <div className="font-semibold text-white mb-2 text-lg">📁 {folder}</div>
                
                {data.subfolders.length > 0 && (
                  <div className="ml-4 mb-3">
                    <div className="text-neutral-400 text-sm mb-1">Subfolders:</div>
                    {data.subfolders.map((subfolder) => (
                      <div key={subfolder} className="text-neutral-300 ml-2">
                        └── 📁 {subfolder}
                      </div>
                    ))}
                  </div>
                )}
                
                {data.images.length > 0 ? (
                  <div className="ml-4">
                    <div className="text-neutral-400 text-sm mb-1">
                      Images ({data.images.length}):
                    </div>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {data.images.map((image) => (
                        <div key={image} className="text-neutral-300 text-xs ml-2 font-mono">
                          └── 🖼️ {image}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="ml-4 text-neutral-500 text-sm">(no images)</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

