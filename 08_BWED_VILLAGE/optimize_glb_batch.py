import bpy
import os
import glob
import time

buildings_dir = os.path.abspath('07_3D_MODEL/buildings')
glb_files = sorted(glob.glob(os.path.join(buildings_dir, '*.glb')))

print(f"=== STARTING BATCH OPTIMIZATION FOR {len(glb_files)} GLB FILES ===")
print(f"Directory: {buildings_dir}\n")

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

    # Clean scene
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # Import
    t0 = time.time()
    bpy.ops.import_scene.gltf(filepath=glb_path)

    # Calculate current tris
    mesh_objs = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    current_tris = sum(len(p.vertices) - 2 for obj in mesh_objs for p in obj.data.polygons)
    total_orig_tris += current_tris

    # 1. Downscale textures to 1024 max
    scaled_imgs = 0
    for img in bpy.data.images:
        w, h = img.size[0], img.size[1]
        if w > 1024 or h > 1024:
            new_w = min(1024, w)
            new_h = min(1024, h)
            # Maintain aspect ratio if non-square
            if w > h:
                new_h = int(h * (1024 / w))
            elif h > w:
                new_w = int(w * (1024 / h))
            img.scale(new_w, new_h)
            scaled_imgs += 1

    # 2. Decimate mesh to ~4,000 - 5,000 triangles
    target_tris = 4200
    if current_tris > target_tris:
        ratio = max(0.005, target_tris / current_tris)
        for obj in mesh_objs:
            mod = obj.modifiers.new(name='Decimate', type='DECIMATE')
            mod.ratio = ratio
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.modifier_apply(modifier='Decimate')

    # Recount tris
    new_tris = sum(len(p.vertices) - 2 for obj in mesh_objs for p in obj.data.polygons)
    total_new_tris += new_tris

    # Export to temp
    tmp_out = f"/tmp/opt_{fname}"
    bpy.ops.export_scene.gltf(
        filepath=tmp_out,
        export_format='GLB',
        export_materials='EXPORT',
        export_image_format='AUTO'
    )

    new_size = os.path.getsize(tmp_out)
    total_new_bytes += new_size

    # Replace original
    os.replace(tmp_out, glb_path)

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

    print(f"[{len(results)}/{len(glb_files)}] {fname[:32]:32} | {current_tris:7d} -> {new_tris:6d} tris (-{tris_pct:.0f}%) | {orig_size/1024/1024:5.2f}MB -> {new_size/1024/1024:5.2f}MB (-{saved_pct:.0f}%) in {elapsed:.1f}s")

total_time = time.time() - start_all
orig_total_mb = total_orig_bytes / (1024 * 1024)
new_total_mb = total_new_bytes / (1024 * 1024)

print("\n" + "="*80)
print(f"BATCH OPTIMIZATION COMPLETED IN {total_time:.1f} SECONDS")
print(f"Total Triangles: {total_orig_tris:,} -> {total_new_tris:,} (-{(1-total_new_tris/total_orig_tris)*100:.1f}%)")
print(f"Total Disk Size: {orig_total_mb:.2f} MB -> {new_total_mb:.2f} MB (-{(1-new_total_mb/orig_total_mb)*100:.1f}%)")
print("="*80)
