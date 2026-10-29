import bpy
import os
import glob
import time

source_dir = os.path.abspath('07_3D_MODEL/buildings')
output_dir = os.path.abspath('08_BWED_VILLAGE/assets/buildings')
os.makedirs(output_dir, exist_ok=True)

glb_files = sorted(glob.glob(os.path.join(source_dir, '*.glb')))

print(f"=== HIGH-FIDELITY OPTIMIZATION FOR {len(glb_files)} VILLAGE GLB FILES ===")
print(f"Source: {source_dir}")
print(f"Destination: {output_dir}\n")

total_orig_bytes = 0
total_new_bytes = 0
total_orig_tris = 0
total_new_tris = 0

results = []
start_all = time.time()

for glb_path in glb_files:
    fname = os.path.basename(glb_path)
    orig_size = os.path.getsize(glb_path)
    total_orig_bytes += orig_size

    bpy.ops.wm.read_factory_settings(use_empty=True)

    t0 = time.time()
    bpy.ops.import_scene.gltf(filepath=glb_path)

    mesh_objs = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    current_tris = sum(len(p.vertices) - 2 for obj in mesh_objs for p in obj.data.polygons)
    total_orig_tris += current_tris

    # 1. Texture Downscaling (Keep crisp 1024x1024)
    scaled_imgs = 0
    for img in bpy.data.images:
        w, h = img.size[0], img.size[1]
        if w > 1024 or h > 1024:
            new_w = min(1024, w)
            new_h = min(1024, h)
            if w > h:
                new_h = int(h * (1024 / w))
            elif h > w:
                new_w = int(w * (1024 / h))
            img.scale(new_w, new_h)
            scaled_imgs += 1

    # 2. Balanced High-Fidelity Decimation (~16,000 tris per building)
    # Preserves fine architectural details, signage, railings, pastry flakes
    target_tris = 16000
    if current_tris > target_tris:
        ratio = max(0.03, target_tris / current_tris)
        for obj in mesh_objs:
            mod = obj.modifiers.new(name='Decimate', type='DECIMATE')
            mod.ratio = ratio
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.modifier_apply(modifier='Decimate')

    new_tris = sum(len(p.vertices) - 2 for obj in mesh_objs for p in obj.data.polygons)
    total_new_tris += new_tris

    # 3. Export to village assets
    out_file = os.path.join(output_dir, fname)
    bpy.ops.export_scene.gltf(
        filepath=out_file,
        export_format='GLB',
        export_materials='EXPORT',
        export_image_format='AUTO'
    )

    new_size = os.path.getsize(out_file)
    total_new_bytes += new_size

    elapsed = time.time() - t0
    saved_pct = (1.0 - (new_size / orig_size)) * 100
    tris_pct = (1.0 - (new_tris / current_tris)) * 100 if current_tris > 0 else 0

    results.append({
        'name': fname,
        'orig_mb': orig_size / (1024 * 1024),
        'new_mb': new_size / (1024 * 1024),
        'orig_k_tris': current_tris / 1000,
        'new_k_tris': new_tris / 1000,
        'saved_pct': saved_pct
    })

    print(f"[{len(results)}/{len(glb_files)}] {fname[:30]:30} | {current_tris:7d} -> {new_tris:6d} tris (-{tris_pct:.0f}%) | {orig_size/1024/1024:5.2f}MB -> {new_size/1024/1024:5.2f}MB (-{saved_pct:.0f}%) in {elapsed:.1f}s")

total_time = time.time() - start_all
orig_total_mb = total_orig_bytes / (1024 * 1024)
new_total_mb = total_new_bytes / (1024 * 1024)

print("\n" + "="*80)
print(f"HIGH-FIDELITY BATCH OPTIMIZATION COMPLETED IN {total_time:.1f} SECONDS")
print(f"Total Triangles: {total_orig_tris:,} -> {total_new_tris:,} (-{(1-total_new_tris/total_orig_tris)*100:.1f}%)")
print(f"Total Disk Size: {orig_total_mb:.2f} MB -> {new_total_mb:.2f} MB (-{(1-new_total_mb/orig_total_mb)*100:.1f}%)")
print("="*80)
