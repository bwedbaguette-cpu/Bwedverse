import bpy
import bmesh
import math
from mathutils import Vector, Matrix

print("=== STARTING BWED VILLAGE 3D DIORAMA GENERATION ===")

# Reset Blender scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# ----------------------------------------------------------------------------
# 1. HELPER: MATERIAL CREATOR
# ----------------------------------------------------------------------------
def create_pbr_mat(name, color_rgba, roughness=0.6, metalness=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        # Blender 4+ uses 'Base Color', 'Roughness', 'Metallic'
        bsdf.inputs['Base Color'].default_value = color_rgba
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metalness
    return mat

mat_matcha = create_pbr_mat("Mat_Matcha_Grass", (0.43, 0.65, 0.26, 1.0), roughness=0.85)
mat_road = create_pbr_mat("Mat_Caramel_Road", (0.87, 0.66, 0.35, 1.0), roughness=0.62)
mat_curb = create_pbr_mat("Mat_Vanilla_Curb", (0.95, 0.92, 0.86, 1.0), roughness=0.55)
mat_wood = create_pbr_mat("Mat_Cinnamon_Wood", (0.47, 0.24, 0.12, 1.0), roughness=0.70)
mat_choco = create_pbr_mat("Mat_Choco_River", (0.15, 0.07, 0.04, 1.0), roughness=0.12, metalness=0.08)
mat_biscuit = create_pbr_mat("Mat_Biscuit_Cliff", (0.80, 0.58, 0.29, 1.0), roughness=0.82)
mat_brownie = create_pbr_mat("Mat_Brownie_Cliff", (0.24, 0.12, 0.06, 1.0), roughness=0.90)
mat_fountain_water = create_pbr_mat("Mat_Caramel_Cream", (0.95, 0.78, 0.42, 1.0), roughness=0.18, metalness=0.05)

# ----------------------------------------------------------------------------
# 2. TERRAIN HEIGHT FUNCTION (ANALYTICAL TOPOGRAPHY)
# ----------------------------------------------------------------------------
def get_natural_elevation(x, z):
    # Observatory Hill (Southwest: centered around x=20, z=80)
    dx_obs = x - 20.0
    dz_obs = z - 80.0
    dist_obs = math.sqrt(dx_obs * dx_obs + dz_obs * dz_obs)
    if dist_obs < 13.0:
        if dist_obs < 6.5:
            return 3.6  # Top plateau
        elif dist_obs < 10.5:
            # Lower terrace
            return 1.8 + (10.5 - dist_obs) / 4.0 * 0.4
        else:
            return (13.0 - dist_obs) / 2.5 * 1.8

    # Woods Hillocks (Northwest: centered around x=16, z=20)
    dx_w = x - 16.0
    dz_w = z - 20.0
    dist_w = math.sqrt(dx_w * dx_w + dz_w * dz_w)
    if dist_w < 11.0:
        return math.cos(dist_w / 11.0 * math.pi * 0.5) * 1.35

    # Gentle slope near East Woods
    dx_e = x - 82.0
    dz_e = z - 20.0
    dist_e = math.sqrt(dx_e * dx_e + dz_e * dz_e)
    if dist_e < 9.0:
        return math.cos(dist_e / 9.0 * math.pi * 0.5) * 0.85

    return 0.0

# ----------------------------------------------------------------------------
# 3. BUILD TERRAIN MESH WITH ORGANIC RELIEF & CANAL TRENCH
# ----------------------------------------------------------------------------
bm = bmesh.new()

# Grid parameters (92m x 92m, from x=4 to 96, z=4 to 96)
res = 52 # 52x52 grid points = smooth topography
step = 92.0 / (res - 1)

grid_verts = []
for iz in range(res):
    row = []
    z = 4.0 + iz * step
    for ix in range(res):
        x = 4.0 + ix * step

        # Rounded diorama island corner test
        dx_c = max(0, abs(x - 50.0) - 38.0)
        dz_c = max(0, abs(z - 50.0) - 38.0)
        dist_corner = math.sqrt(dx_c * dx_c + dz_c * dz_c)
        if dist_corner > 8.0:
            # Beyond rounded corner, will be clipped
            row.append(None)
            continue

        base_y = get_natural_elevation(x, z)

        # Chocolate Canal Trench (z around 36m, width 9m)
        canal_dist = abs(z - 36.0)
        if canal_dist < 4.5:
            # Trench dip down to -1.1m
            t_canal = canal_dist / 4.5
            # Smooth bell curve trench
            dip = math.cos(t_canal * math.pi * 0.5) * 1.25
            y = base_y - dip
        else:
            y = base_y

        v = bm.verts.new((x, y, z))
        row.append(v)
    grid_verts.append(row)

# Create terrain faces
for iz in range(res - 1):
    for ix in range(res - 1):
        v00 = grid_verts[iz][ix]
        v10 = grid_verts[iz][ix + 1]
        v11 = grid_verts[iz + 1][ix + 1]
        v01 = grid_verts[iz + 1][ix]
        if v00 and v10 and v11 and v01:
            bm.faces.new((v00, v10, v11, v01))
        elif v00 and v10 and v11:
            bm.faces.new((v00, v10, v11))
        elif v00 and v11 and v01:
            bm.faces.new((v00, v11, v01))
        elif v10 and v11 and v01:
            bm.faces.new((v10, v11, v01))
        elif v00 and v10 and v01:
            bm.faces.new((v00, v10, v01))

bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
mesh_terrain = bpy.data.meshes.new("Mesh_Terrain_Matcha")
bm.to_mesh(mesh_terrain)
bm.free()

obj_terrain = bpy.data.objects.new("Terrain_Matcha", mesh_terrain)
obj_terrain.data.materials.append(mat_matcha)
bpy.context.scene.collection.objects.link(obj_terrain)

# ----------------------------------------------------------------------------
# 4. BUILD DIORAMA ISLAND CLIFFS (BISCUIT & BROWNIE STRATA)
# ----------------------------------------------------------------------------
# Perimeter edge ring extrusion downwards
bm_cliff = bmesh.new()

# Create island boundary polyline
boundary_pts = []
num_pts = 72
for i in range(num_pts):
    angle = (i / num_pts) * math.pi * 2.0
    ca = math.cos(angle)
    sa = math.sin(angle)
    # Superellipse / rounded rectangle
    r_x = 44.0
    r_z = 44.0
    rad = 7.0
    px = 50.0 + max(min(ca * 48.0, 42.0), -42.0)
    pz = 50.0 + max(min(sa * 48.0, 42.0), -42.0)
    boundary_pts.append((px, pz))

# 3 vertical rings:
# Ring 0: Top rim (y around 0m)
# Ring 1: Biscuit layer shelf (y = -1.8m, inset 1.2m)
# Ring 2: Brownie bottom layer (y = -3.8m, inset 3.0m)
ring0 = [bm_cliff.verts.new((px, get_natural_elevation(px, pz), pz)) for px, pz in boundary_pts]
ring1 = [bm_cliff.verts.new((50.0 + (px - 50.0) * 0.97, -1.8, 50.0 + (pz - 50.0) * 0.97)) for px, pz in boundary_pts]
ring2 = [bm_cliff.verts.new((50.0 + (px - 50.0) * 0.92, -3.8, 50.0 + (pz - 50.0) * 0.92)) for px, pz in boundary_pts]
ring3 = [bm_cliff.verts.new((50.0 + (px - 50.0) * 0.85, -4.2, 50.0 + (pz - 50.0) * 0.85)) for px, pz in boundary_pts]

# Create cliff faces
for i in range(num_pts):
    next_i = (i + 1) % num_pts
    # Upper biscuit tier
    f_bisc = bm_cliff.faces.new((ring0[i], ring0[next_i], ring1[next_i], ring1[i]))
    f_bisc.material_index = 0
    # Lower brownie tier
    f_brown = bm_cliff.faces.new((ring1[i], ring1[next_i], ring2[next_i], ring2[i]))
    f_brown.material_index = 1
    # Underside bevel
    f_under = bm_cliff.faces.new((ring2[i], ring2[next_i], ring3[next_i], ring3[i]))
    f_under.material_index = 1

# Bottom closure face
bm_cliff.faces.new(reversed(ring3))

bmesh.ops.recalc_face_normals(bm_cliff, faces=bm_cliff.faces)
mesh_cliffs = bpy.data.meshes.new("Mesh_Diorama_Cliffs")
bm_cliff.to_mesh(mesh_cliffs)
bm_cliff.free()

obj_cliffs = bpy.data.objects.new("Diorama_Cliffs", mesh_cliffs)
obj_cliffs.data.materials.append(mat_biscuit)
obj_cliffs.data.materials.append(mat_brownie)
bpy.context.scene.collection.objects.link(obj_cliffs)

# ----------------------------------------------------------------------------
# 5. CHOCOLATE CANAL WATER & QUAYS
# ----------------------------------------------------------------------------
# A. Chocolate River Water Surface
bm_choco = bmesh.new()
c_verts = [
    bm_choco.verts.new((2.0, -0.32, 31.8)),
    bm_choco.verts.new((98.0, -0.32, 31.8)),
    bm_choco.verts.new((98.0, -0.32, 40.2)),
    bm_choco.verts.new((2.0, -0.32, 40.2)),
]
bm_choco.faces.new(c_verts)
mesh_choco = bpy.data.meshes.new("Mesh_Choco_Water")
bm_choco.to_mesh(mesh_choco)
bm_choco.free()

obj_choco = bpy.data.objects.new("Choco_Water", mesh_choco)
obj_choco.data.materials.append(mat_choco)
bpy.context.scene.collection.objects.link(obj_choco)

# B. Cinnamon Wood Quays (North & South canal banks)
bm_quays = bmesh.new()
# North Quayside Boardwalk (z = 30.2 to 31.8, y = 0.08)
nq0 = bm_quays.verts.new((6.0, 0.08, 30.2))
nq1 = bm_quays.verts.new((94.0, 0.08, 30.2))
nq2 = bm_quays.verts.new((94.0, 0.08, 31.8))
nq3 = bm_quays.verts.new((6.0, 0.08, 31.8))
bm_quays.faces.new((nq0, nq1, nq2, nq3))

# South Quayside Boardwalk (z = 40.2 to 41.8, y = 0.08)
sq0 = bm_quays.verts.new((6.0, 0.08, 40.2))
sq1 = bm_quays.verts.new((94.0, 0.08, 40.2))
sq2 = bm_quays.verts.new((94.0, 0.08, 41.8))
sq3 = bm_quays.verts.new((6.0, 0.08, 41.8))
bm_quays.faces.new((sq0, sq1, sq2, sq3))

# Mooring Jetties / Small Docks extending into canal
for jetty_x in [34.0, 66.0]:
    # 3.2m long jetty into canal
    j0 = bm_quays.verts.new((jetty_x - 1.2, 0.06, 31.8))
    j1 = bm_quays.verts.new((jetty_x + 1.2, 0.06, 31.8))
    j2 = bm_quays.verts.new((jetty_x + 1.2, 0.06, 34.6))
    j3 = bm_quays.verts.new((jetty_x - 1.2, 0.06, 34.6))
    bm_quays.faces.new((j0, j1, j2, j3))

bmesh.ops.recalc_face_normals(bm_quays, faces=bm_quays.faces)
mesh_quays = bpy.data.meshes.new("Mesh_Quays_Wood")
bm_quays.to_mesh(mesh_quays)
bm_quays.free()

obj_quays = bpy.data.objects.new("Quays_Wood", mesh_quays)
obj_quays.data.materials.append(mat_wood)
bpy.context.scene.collection.objects.link(obj_quays)

# ----------------------------------------------------------------------------
# 6. ARCHED WOODEN BRIDGES OVER CHOCOLATE CANAL
# ----------------------------------------------------------------------------
def build_arched_bridge(cx, width, span=10.0, arch_height=0.95):
    bm_br = bmesh.new()
    steps = 14
    half_w = width * 0.5
    deck_verts_left = []
    deck_verts_right = []

    for i in range(steps + 1):
        frac = i / steps
        z = (36.0 - span * 0.5) + frac * span
        # Arched parabola
        y = math.sin(frac * math.pi) * arch_height + 0.12
        v_l = bm_br.verts.new((cx - half_w, y, z))
        v_r = bm_br.verts.new((cx + half_w, y, z))
        deck_verts_left.append(v_l)
        deck_verts_right.append(v_r)

    # Deck faces
    for i in range(steps):
        bm_br.faces.new((
            deck_verts_left[i],
            deck_verts_right[i],
            deck_verts_right[i + 1],
            deck_verts_left[i + 1]
        ))

    # Railings (Left & Right balustrades)
    rail_h = 0.65
    for i in range(steps):
        # Left Railing quad
        rl0 = deck_verts_left[i]
        rl1 = deck_verts_left[i + 1]
        rl0_top = bm_br.verts.new((rl0.co.x, rl0.co.y + rail_h, rl0.co.z))
        rl1_top = bm_br.verts.new((rl1.co.x, rl1.co.y + rail_h, rl1.co.z))
        bm_br.faces.new((rl0, rl1, rl1_top, rl0_top))

        # Right Railing quad
        rr0 = deck_verts_right[i]
        rr1 = deck_verts_right[i + 1]
        rr0_top = bm_br.verts.new((rr0.co.x, rr0.co.y + rail_h, rr0.co.z))
        rr1_top = bm_br.verts.new((rr1.co.x, rr1.co.y + rail_h, rr1.co.z))
        bm_br.faces.new((rr0, rr0_top, rr1_top, rr1))

    bmesh.ops.recalc_face_normals(bm_br, faces=bm_br.faces)
    mesh_br = bpy.data.meshes.new(f"Mesh_Bridge_{cx}")
    bm_br.to_mesh(mesh_br)
    bm_br.free()

    obj_br = bpy.data.objects.new(f"Bridge_{cx}", mesh_br)
    obj_br.data.materials.append(mat_wood)
    bpy.context.scene.collection.objects.link(obj_br)

# Build the 3 Bridges
build_arched_bridge(50.0, width=6.6, span=10.4, arch_height=0.98) # Grand Center Bridge
build_arched_bridge(20.0, width=4.8, span=10.0, arch_height=0.75) # West Bridge
build_arched_bridge(80.0, width=4.8, span=10.0, arch_height=0.75) # East Bridge

# ----------------------------------------------------------------------------
# 7. PAVED COBBLESTONE ROADS, PLAZA & CURBS
# ----------------------------------------------------------------------------
bm_roads = bmesh.new()

# A. Grand-Place Central Plaza (Octagon at x=50, z=52, radius=13.5m)
cx_pl = 50.0
cz_pl = 52.0
rad_pl = 13.5
plaza_segments = 24
pl_center = bm_roads.verts.new((cx_pl, 0.05, cz_pl))
pl_rim = []
for i in range(plaza_segments):
    angle = (i / plaza_segments) * math.pi * 2.0
    px = cx_pl + math.cos(angle) * rad_pl
    pz = cz_pl + math.sin(angle) * rad_pl
    v = bm_roads.verts.new((px, 0.05, pz))
    pl_rim.append(v)

for i in range(plaza_segments):
    next_i = (i + 1) % plaza_segments
    bm_roads.faces.new((pl_center, pl_rim[i], pl_rim[next_i]))

# B. Connecting Roads (Width 5.0m to 6.0m)
def add_road_ribbon(points, width):
    half = width * 0.5
    for i in range(len(points) - 1):
        p0 = points[i]
        p1 = points[i + 1]
        dx = p1[0] - p0[0]
        dz = p1[1] - p0[1]
        length = math.sqrt(dx * dx + dz * dz)
        if length == 0: continue
        nx = -dz / length * half
        nz = dx / length * half

        v0_l = bm_roads.verts.new((p0[0] + nx, p0[2], p0[1] + nz))
        v0_r = bm_roads.verts.new((p0[0] - nx, p0[2], p0[1] - nz))
        v1_l = bm_roads.verts.new((p1[0] + nx, p1[2], p1[1] + nz))
        v1_r = bm_roads.verts.new((p1[0] - nx, p1[2], p1[1] - nz))
        bm_roads.faces.new((v0_l, v0_r, v1_r, v1_l))

# 1. Avenue du Port (Connects Grand Bridge at z=41.2 to Plaza at z=52)
add_road_ribbon([(50.0, 41.2, 0.05), (50.0, 52.0, 0.05)], width=6.2)

# 2. Avenue des Pâtissiers (East to Gourmet District)
add_road_ribbon([(50.0, 52.0, 0.05), (68.0, 52.0, 0.05), (84.0, 50.0, 0.05)], width=5.4)

# 3. Rue des Artisans (West to Village Fleuri)
add_road_ribbon([(50.0, 52.0, 0.05), (32.0, 52.0, 0.05), (14.0, 54.0, 0.05)], width=5.4)

# 4. Boulevard de la Fête Foraine (Southeast)
add_road_ribbon([(68.0, 52.0, 0.05), (76.0, 68.0, 0.05), (78.0, 84.0, 0.05)], width=5.2)

# 5. Sentier de l'Observatoire (Southwest leading up hill)
add_road_ribbon([
    (32.0, 52.0, 0.05),
    (24.0, 64.0, 0.25),
    (21.0, 72.0, 1.20),
    (19.0, 78.0, 2.80)
], width=4.4)

# 6. North Bridge Connection roads
add_road_ribbon([(50.0, 30.5, 0.05), (50.0, 16.0, 0.05)], width=5.6)
add_road_ribbon([(20.0, 30.5, 0.05), (20.0, 18.0, 0.05)], width=4.6)
add_road_ribbon([(80.0, 30.5, 0.05), (80.0, 18.0, 0.05)], width=4.6)

# South Bridge Connection roads
add_road_ribbon([(20.0, 41.5, 0.05), (20.0, 52.0, 0.05), (32.0, 52.0, 0.05)], width=4.6)
add_road_ribbon([(80.0, 41.5, 0.05), (80.0, 50.0, 0.05), (68.0, 52.0, 0.05)], width=4.6)

bmesh.ops.recalc_face_normals(bm_roads, faces=bm_roads.faces)
mesh_roads = bpy.data.meshes.new("Mesh_Roads_Caramel")
bm_roads.to_mesh(mesh_roads)
bm_roads.free()

obj_roads = bpy.data.objects.new("Roads_Caramel", mesh_roads)
obj_roads.data.materials.append(mat_road)
bpy.context.scene.collection.objects.link(obj_roads)

# ----------------------------------------------------------------------------
# 8. CENTRAL FOUNTAIN BASIN (GRAND-PLACE)
# ----------------------------------------------------------------------------
bm_ft = bmesh.new()
ft_segments = 24
outer_r = 3.6
inner_r = 3.0
rim_h = 0.45

# Create double ring for stone rim
for i in range(ft_segments):
    a0 = (i / ft_segments) * math.pi * 2.0
    a1 = ((i + 1) % ft_segments / ft_segments) * math.pi * 2.0

    # Outer wall quad
    p0_out = Vector((cx_pl + math.cos(a0) * outer_r, 0.05, cz_pl + math.sin(a0) * outer_r))
    p1_out = Vector((cx_pl + math.cos(a1) * outer_r, 0.05, cz_pl + math.sin(a1) * outer_r))
    p0_top = Vector((p0_out.x, rim_h, p0_out.z))
    p1_top = Vector((p1_out.x, rim_h, p1_out.z))

    p0_in = Vector((cx_pl + math.cos(a0) * inner_r, rim_h, cz_pl + math.sin(a0) * inner_r))
    p1_in = Vector((cx_pl + math.cos(a1) * inner_r, rim_h, cz_pl + math.sin(a1) * inner_r))
    p0_floor = Vector((p0_in.x, 0.18, p0_in.z))
    p1_floor = Vector((p1_in.x, 0.18, p1_in.z))

    # Outer wall
    v_out0 = bm_ft.verts.new(p0_out)
    v_out1 = bm_ft.verts.new(p1_out)
    v_top0 = bm_ft.verts.new(p0_top)
    v_top1 = bm_ft.verts.new(p1_top)
    bm_ft.faces.new((v_out0, v_out1, v_top1, v_top0))

    # Top rim cap
    v_in0 = bm_ft.verts.new(p0_in)
    v_in1 = bm_ft.verts.new(p1_in)
    bm_ft.faces.new((v_top0, v_top1, v_in1, v_in0))

# Fountain water / caramel cream pool
f_center = bm_ft.verts.new((cx_pl, 0.28, cz_pl))
for i in range(ft_segments):
    a0 = (i / ft_segments) * math.pi * 2.0
    a1 = ((i + 1) % ft_segments / ft_segments) * math.pi * 2.0
    v0 = bm_ft.verts.new((cx_pl + math.cos(a0) * inner_r, 0.28, cz_pl + math.sin(a0) * inner_r))
    v1 = bm_ft.verts.new((cx_pl + math.cos(a1) * inner_r, 0.28, cz_pl + math.sin(a1) * inner_r))
    bm_ft.faces.new((f_center, v0, v1))

bmesh.ops.recalc_face_normals(bm_ft, faces=bm_ft.faces)
mesh_ft = bpy.data.meshes.new("Mesh_Fountain_Basin")
bm_ft.to_mesh(mesh_ft)
bm_ft.free()

obj_ft = bpy.data.objects.new("Fountain_Basin", mesh_ft)
obj_ft.data.materials.append(mat_curb)
bpy.context.scene.collection.objects.link(obj_ft)

# ----------------------------------------------------------------------------
# 9. EXPORT COMPLETE UNIFIED LEVEL TO GLTF / GLB
# ----------------------------------------------------------------------------
export_path = "08_BWED_VILLAGE/assets/maps/bwed-village-diorama.glb"
print(f"Exporting stylized diorama level to {export_path}...")

bpy.ops.export_scene.gltf(
    filepath=export_path,
    export_format='GLB',
    use_selection=False,
    export_apply=True,
    export_yup=True,
    export_materials='EXPORT',
    export_cameras=False,
    export_lights=False
)

print("=== DIORAMA LEVEL EXPORT COMPLETE! ===")
